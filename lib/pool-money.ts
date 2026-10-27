/**
 * Pool money movement — settling a payment, and giving it back.
 *
 * Two rules the previous code did not have:
 *
 *   1. Nothing is credited until PesaPal says the money arrived, and what is
 *      credited is what PesaPal says it received — not the number the payer
 *      typed into our form. A pool balance is money the business holds.
 *   2. Every movement is one ledger row, written through lib/pool-ledger, so a
 *      replayed IPN cannot credit twice and a retried refund cannot debit
 *      twice.
 *
 * Refunds are real here: PesaPal's RefundRequest is called per contribution
 * using the tracking id stored at checkout, and the outcome is recorded on the
 * contribution and in the ledger — a refund that failed stays visible as
 * failed instead of being logged and forgotten.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { getTransactionStatus, refundPayment } from "@/lib/payment";
import { sendEmail, sendPoolMilestoneAlert } from "@/lib/notifications";
import {
  postContributionEntry,
  postRefundEntry,
  resolvePoolBalance,
  refundSummary,
  isSchemaMissing,
  type PoolKind,
  type LedgerEntry,
} from "@/lib/pool-ledger";

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** PesaPal amounts are two-decimal; a ksh of drift is a rounding artefact. */
const differs = (a: number, b: number) => Math.abs(a - b) > 0.5;

type ContributionRow = {
  id: string;
  pool_id: string;
  amount: number;
  paid_amount?: number | null;
  is_verified: boolean;
  pesapal_tracking_id?: string | null;
  payment_ref?: string | null;
};

async function loadContribution(
  contributionId: string
): Promise<{ kind: PoolKind; row: ContributionRow } | null> {
  const consumer = await supabaseAdmin
    .from("pool_contributions")
    .select("id, pool_id, amount, paid_amount, is_verified, pesapal_tracking_id, payment_ref")
    .eq("id", contributionId)
    .maybeSingle();

  if (consumer.error) {
    console.error("[pool-money] consumer lookup failed:", consumer.error.message);
    return null;
  }
  if (consumer.data) return { kind: "consumer", row: consumer.data as ContributionRow };

  const corporate = await supabaseAdmin
    .from("corporate_pool_contributions")
    .select("id, pool_id, amount, is_verified, payment_ref")
    .eq("id", contributionId)
    .maybeSingle();

  if (corporate.error) {
    console.error("[pool-money] corporate lookup failed:", corporate.error.message);
    return null;
  }
  if (!corporate.data) return null;
  return { kind: "corporate", row: corporate.data as ContributionRow };
}

export type SettleResult =
  | {
      ok: true;
      alreadySettled: boolean;
      paidAmount: number;
      balance: number;
      targetHit: boolean;
      mismatch: boolean;
    }
  | { ok: false; reason: "not_found" | "psp_unreachable" | "not_completed" | "unverifiable"; detail?: string };

export type SettleOptions = {
  orderTrackingId?: string | null;
  receiptNumber?: string | null;
  /**
   * Pass only when the caller has already re-queried PesaPal for this payment
   * (the IPN does, before dispatching) so the status is not fetched twice.
   * Never pass this from a request body — that would let a client assert its
   * own payment.
   */
  trusted?: { paidAmount?: number | null; receiptNumber?: string | null };
};

/**
 * Verify, credit, and update the pool — exactly once per contribution.
 */
export async function settlePoolContribution(
  contributionId: string,
  opts: SettleOptions = {}
): Promise<SettleResult> {
  const loaded = await loadContribution(contributionId);
  if (!loaded) return { ok: false, reason: "not_found" };

  const { kind, row } = loaded;
  const requested = num(row.amount);

  /* Already settled: make sure the ledger has the credit (a contribution
     verified before the ledger existed backfills here), refresh the balance,
     and stop. Re-running the milestones would re-send the alert. */
  if (row.is_verified) {
    const paid = num(row.paid_amount) || requested;
    await postContributionEntry({
      poolId: row.pool_id,
      poolKind: kind,
      contributionId: row.id,
      amount: paid,
      pspAmount: row.paid_amount ?? null,
      paymentRef: row.payment_ref ?? null,
      pesapalTrackingId: row.pesapal_tracking_id ?? null,
      notes: "already verified",
    });
    const resolved = await resolvePoolBalance(row.pool_id, kind);
    return {
      ok: true,
      alreadySettled: true,
      paidAmount: paid,
      balance: resolved.balance,
      targetHit: false,
      mismatch: false,
    };
  }

  // ── Evidence that the money arrived ────────────────────────────────────────
  let paidAmount = requested;
  let receipt: string | null = null;
  let trackingId: string | null = row.pesapal_tracking_id ?? null;
  let mismatch = false;

  if (opts.trusted) {
    paidAmount = num(opts.trusted.paidAmount) || requested;
    receipt = opts.trusted.receiptNumber ?? null;
  } else {
    trackingId = opts.orderTrackingId ?? trackingId;
    if (!trackingId) return { ok: false, reason: "unverifiable" };

    try {
      const status = await getTransactionStatus(trackingId);
      if (status.status !== "completed") {
        return { ok: false, reason: "not_completed", detail: status.status };
      }
      paidAmount = num(status.amount) || requested;
      receipt = status.receiptNumber ?? opts.receiptNumber ?? null;
    } catch (e) {
      // Do not credit on a failed status check: an unreachable PesaPal must
      // not read as "paid", or the balance claims money we cannot see.
      return { ok: false, reason: "psp_unreachable", detail: (e as Error).message };
    }
  }

  if (differs(paidAmount, requested)) mismatch = true;

  // ── Record what we hold ────────────────────────────────────────────────────
  const note = mismatch
    ? `amount mismatch: requested KES ${requested.toFixed(2)}, received KES ${paidAmount.toFixed(2)}`
    : trackingId
    ? "verified with PesaPal"
    : "verified by caller";

  const update: Record<string, unknown> = {
    is_verified: true,
    paid_amount: paidAmount,
    payment_ref: receipt ?? trackingId ?? row.payment_ref ?? null,
  };
  if (kind === "consumer") {
    update.mpesa_receipt_number = receipt;
  }

  let { error: writeErr } = await supabaseAdmin
    .from(kind === "consumer" ? "pool_contributions" : "corporate_pool_contributions")
    .update(update)
    .eq("id", row.id);

  /* paid_amount ships with the money-safety migration. If it is not applied
     yet, the contribution still has to be able to settle — fall back to the
     columns that have always existed rather than refusing the payment. */
  if (writeErr && isSchemaMissing(writeErr)) {
    const legacy: Record<string, unknown> = {
      is_verified: true,
      payment_ref: receipt ?? trackingId ?? row.payment_ref ?? null,
    };
    if (kind === "consumer") legacy.mpesa_receipt_number = receipt;
    ({ error: writeErr } = await supabaseAdmin
      .from(kind === "consumer" ? "pool_contributions" : "corporate_pool_contributions")
      .update(legacy)
      .eq("id", row.id));
    if (!writeErr) {
      console.warn(
        "[pool-money] settled without paid_amount — the money-safety migration has not been applied"
      );
    }
  }

  if (writeErr) {
    console.error("[pool-money] could not mark contribution verified:", writeErr.message);
    return { ok: false, reason: "unverifiable", detail: writeErr.message };
  }

  const entry = await postContributionEntry({
    poolId: row.pool_id,
    poolKind: kind,
    contributionId: row.id,
    amount: paidAmount,
    pspAmount: paidAmount,
    paymentRef: receipt ?? trackingId,
    pesapalTrackingId: trackingId,
    notes: note,
  });
  if (!entry.ok && !entry.unavailable) {
    console.error("[pool-money] ledger credit failed:", entry.error);
  }

  if (mismatch) {
    console.error(
      `[pool-money] contribution ${row.id}: requested ${requested} but PesaPal reports ${paidAmount}`
    );
    void flagMismatchToOps({
      contributionId: row.id,
      poolId: row.pool_id,
      requested,
      received: paidAmount,
    });
  }

  const { balance, targetHit } = await recomputePool(row.pool_id, kind);

  return { ok: true, alreadySettled: false, paidAmount, balance, targetHit, mismatch };
}

/** Ops needs to know when the figure on the form and the figure in the bank differ. */
async function flagMismatchToOps(args: {
  contributionId: string;
  poolId: string;
  requested: number;
  received: number;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail(
    to,
    "Pool contribution amount mismatch",
    `<div style="font-family:system-ui,sans-serif">
       <h2>Contribution received for a different amount</h2>
       <p>Contribution <code>${args.contributionId}</code> on pool <code>${args.poolId}</code></p>
       <p>Requested: KES ${args.requested.toFixed(2)}<br/>Received: KES ${args.received.toFixed(2)}</p>
       <p>The pool balance has been credited with the amount received.</p>
     </div>`,
    `Contribution ${args.contributionId}: requested KES ${args.requested}, received KES ${args.received}.`
  ).catch(() => undefined);
}

// ── Balance, status and milestones ────────────────────────────────────────────

type RecomputeResult = { balance: number; targetHit: boolean };

/**
 * Recompute the pool from the ledger and push it onto the pool row: balance,
 * completion at target, and the milestone flags — set on the write so a
 * replayed payment cannot re-send the same alert.
 */
export async function recomputePool(poolId: string, kind: PoolKind): Promise<RecomputeResult> {
  const resolved = await resolvePoolBalance(poolId, kind);
  const balance = resolved.balance;
  const table = kind === "consumer" ? "group_gifting_pools" : "corporate_gift_pools";

  const { data: pool, error } = await supabaseAdmin
    .from(table)
    .select(
      `id, title, slug, status, target_amount, current_balance,
       milestone_25_sent, milestone_50_sent, milestone_75_sent, milestone_100_sent,
       ${kind === "consumer" ? "organiser_user_id" : "corporate_account_id"}`
    )
    .eq("id", poolId)
    .maybeSingle();

  if (error || !pool) {
    console.error("[pool-money] pool lookup failed:", error?.message ?? "not found");
    return { balance, targetHit: false };
  }

  const target = num(pool.target_amount);
  const previous = num(pool.current_balance);
  const poolRow = pool as unknown as Record<string, unknown>;
  const updates: Record<string, unknown> = { current_balance: balance };

  const targetHit = target > 0 && balance >= target;
  if (targetHit && pool.status === "active") updates.status = "completed";

  const oldPct = target > 0 ? Math.floor((previous / target) * 100) : 0;
  const newPct = target > 0 ? Math.floor((balance / target) * 100) : 0;
  const crossed: number[] = [];

  if (target > 0 && kind === "consumer") {
    for (const milestone of [25, 50, 75, 100]) {
      const column = `milestone_${milestone}_sent`;
      if (!poolRow[column] && oldPct < milestone && newPct >= milestone) {
        updates[column] = true;
        crossed.push(milestone);
      }
    }
  }

  const changed =
    Math.abs(previous - balance) > 0.001 ||
    Object.keys(updates).length > 1 ||
    crossed.length > 0;

  if (changed) {
    const { error: updateErr } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq("id", poolId);
    if (updateErr) console.error("[pool-money] pool update failed:", updateErr.message);
  }

  if (crossed.length > 0 && kind === "consumer") {
    const highest = Math.max(...crossed);
    void notifyMilestone(poolRow, highest).catch((e) =>
      console.error("[pool-money] milestone notification failed:", e)
    );
  }

  return { balance, targetHit };
}

async function notifyMilestone(pool: Record<string, unknown>, milestonePct: number) {
  const organiserId = pool.organiser_user_id as string | null;
  let email: string | null = null;
  let phone: string | null = null;

  if (organiserId) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("email, phone")
      .eq("id", organiserId)
      .maybeSingle();
    email = data?.email ?? null;
    phone = data?.phone ?? null;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://touchgiftshop.co.ke";
  await sendPoolMilestoneAlert({
    poolTitle: String(pool.title ?? "your gift pool"),
    milestonePct,
    organizerEmail: email,
    organizerPhone: phone,
    poolUrl: `${site}/pool/${pool.slug}`,
  });
}

// ── Refunds ───────────────────────────────────────────────────────────────────

export type RefundRun = {
  /** Verified contributions considered. */
  total: number;
  refunded: number;
  refundedAmount: number;
  failed: number;
  /** Money we hold that PesaPal cannot return automatically. */
  manual: number;
  failures: { id: string; name: string; message: string }[];
  /** True only when every contribution came back. */
  complete: boolean;
};

/**
 * Record a refund outcome on the contribution.
 *
 * refund_status is the honest column (payment_method still holds how the
 * contributor paid). If the migration has not been applied, fall back to the
 * payment_method outcome the previous code used, so a refund is never
 * recorded nowhere.
 */
async function markRefund(
  table: string,
  id: string,
  fields: Record<string, unknown>
): Promise<void> {
  const { error } = await supabaseAdmin.from(table).update(fields).eq("id", id);
  if (!error) return;

  if (isSchemaMissing(error)) {
    const outcome =
      fields.refund_status === "completed"
        ? "refunded"
        : fields.refund_status === "failed"
        ? "refund_failed"
        : "refund_unsupported";
    const { error: legacyErr } = await supabaseAdmin
      .from(table)
      .update({ payment_method: outcome })
      .eq("id", id);
    if (legacyErr) {
      console.error("[pool-money] could not record refund outcome:", legacyErr.message);
    } else {
      console.warn("[pool-money] refund recorded in payment_method — apply the money-safety migration");
    }
    return;
  }

  console.error("[pool-money] could not record refund outcome:", error.message);
}

/**
 * Refund every verified contribution in a pool.
 *
 * Idempotent: contributions already marked refunded are counted, not refunded
 * again (PesaPal allows one refund per payment, so a second attempt would fail
 * anyway — and would burn the only attempt).
 */
export async function refundPoolContributions(pool: {
  id: string;
  slug: string;
  title: string;
  kind: PoolKind;
  initiatedBy: string;
}): Promise<RefundRun> {
  const table = pool.kind === "consumer" ? "pool_contributions" : "corporate_pool_contributions";
  const baseFields = pool.kind === "consumer"
    ? "id, amount, paid_amount, pesapal_tracking_id, contributor_name, refund_status, refund_message"
    : "id, amount, contributor_name, refund_status, refund_message";

  /* Loosely typed: the literal select string makes PostgREST's parser types
     disagree between the first attempt and the fallback. */
  type Listed = { data: unknown; error: { code?: string | null; message: string } | null };

  let listed: Listed = await supabaseAdmin
    .from(table)
    .select(baseFields)
    .eq("pool_id", pool.id)
    .eq("is_verified", true);

  /* Until the money-safety migration is applied, refund_status is not a
     column: list without it rather than refusing to refund at all. */
  if (listed.error && isSchemaMissing(listed.error)) {
    const fallback = baseFields
      .split(", ")
      .filter((f) => f !== "refund_status" && f !== "refund_message" && f !== "paid_amount")
      .join(", ");
    listed = await supabaseAdmin
      .from(table)
      .select(fallback)
      .eq("pool_id", pool.id)
      .eq("is_verified", true);
  }

  const { data, error } = listed;

  const run: RefundRun = {
    total: 0,
    refunded: 0,
    refundedAmount: 0,
    failed: 0,
    manual: 0,
    failures: [],
    complete: true,
  };

  if (error) {
    console.error("[pool-money] refund listing failed:", error.message);
    run.complete = false;
    return run;
  }

  const contributions = (data ?? []) as unknown as Record<string, unknown>[];
  run.total = contributions.length;

  for (const c of contributions) {
    const id = String(c.id);
    const name = String(c.contributor_name ?? "contributor");
    const amount = num(c.paid_amount) || num(c.amount);

    if (c.refund_status === "completed") {
      run.refunded += 1;
      run.refundedAmount += amount;
      continue;
    }

    const trackingId = c.pesapal_tracking_id ? String(c.pesapal_tracking_id) : null;

    /* No tracking id means no PesaPal payment: a corporate contribution
       recorded against an M-Pesa transfer, or a row from before checkout
       stored the id. Those cannot be reversed by API and must not be
       reported as refunded. */
    if (!trackingId) {
      run.manual += 1;
      await markRefund(table, id, {
        refund_status: "unsupported",
        refund_message: "No PesaPal tracking id — reverse manually against the original transfer.",
      });
      continue;
    }

    let message: string;
    let success = false;
    try {
      const result = await refundPayment(
        trackingId,
        amount,
        pool.initiatedBy,
        `Pool "${pool.title}" (${pool.slug})`
      );
      success = result.success;
      message = result.message;
    } catch (e) {
      message = (e as Error).message ?? "Refund request failed";
    }

    if (success) {
      run.refunded += 1;
      run.refundedAmount += amount;
      await markRefund(table, id, {
        refund_status: "completed",
        refund_message: message,
        refunded_at: new Date().toISOString(),
      });

      const entry = await postRefundEntry({
        poolId: pool.id,
        poolKind: pool.kind,
        contributionId: id,
        amount,
        pspAmount: amount,
        paymentRef: trackingId,
        pesapalTrackingId: trackingId,
        notes: message,
      });
      if (!entry.ok && !entry.unavailable) {
        console.error("[pool-money] ledger debit failed:", entry.error);
      }
    } else {
      run.failed += 1;
      run.failures.push({ id, name, message });
      await markRefund(table, id, {
        refund_status: "failed",
        refund_message: message,
      });

      await postRefundEntry({
        poolId: pool.id,
        poolKind: pool.kind,
        contributionId: id,
        amount,
        pspAmount: amount,
        paymentRef: trackingId,
        pesapalTrackingId: trackingId,
        status: "failed",
        notes: message,
      });
      console.error(`[pool-money] refund failed for ${id}: ${message}`);
    }
  }

  run.complete = run.failed === 0 && run.manual === 0 && run.refunded === run.total;
  return run;
}

/** Ledger totals for a pool — what came in, what went back, what is held. */
export function poolMoneyTotals(entries: LedgerEntry[]) {
  const credits = entries
    .filter((e) => e.entry_type === "contribution" && e.status === "posted")
    .reduce((sum, e) => sum + num(e.amount), 0);
  const refunds = refundSummary(entries);
  return {
    contributed: credits,
    refunded: refunds.refundedAmount,
    refundedCount: refunds.refundedCount,
    failedRefunds: refunds.failedCount,
    held: credits - refunds.refundedAmount,
  };
}

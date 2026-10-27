/**
 * The pool ledger.
 *
 * Every contribution that clears payment becomes exactly one credit, and every
 * refund becomes exactly one debit — enforced by the unique index on
 * (contribution_id, entry_type), so a replayed IPN or a retried refund cannot
 * post twice. A pool's balance is the ledger's net position, not a sum over
 * whatever the contributions table happens to say today.
 *
 * Every read here degrades to the old behaviour when the migration has not
 * been applied: the code has to run against a database that may predate this
 * file, and a missing ledger must never show a funded pool as empty.
 */

import { supabaseAdmin } from "@/lib/supabase";

export type PoolKind = "consumer" | "corporate";

export type LedgerEntryType = "contribution" | "refund";
export type LedgerDirection = "credit" | "debit";
export type LedgerStatus = "posted" | "failed";

export type LedgerEntry = {
  id: string;
  pool_id: string;
  pool_kind: PoolKind;
  contribution_id: string;
  entry_type: LedgerEntryType;
  direction: LedgerDirection;
  amount: number;
  psp_amount: number | null;
  status: LedgerStatus;
  payment_ref: string | null;
  pesapal_tracking_id: string | null;
  notes: string | null;
  created_at: string;
};

const TABLE = "pool_ledger_entries";

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Codes that mean "this table/column is not in the database yet". */
const SCHEMA_MISSING_CODES = new Set(["42P01", "PGRST205", "PGRST204", "42703"]);

export function isSchemaMissing(error: { code?: string | null } | null): boolean {
  if (!error) return false;
  return SCHEMA_MISSING_CODES.has(error.code ?? "");
}

type EntryWrite = {
  poolId: string;
  poolKind: PoolKind;
  contributionId: string;
  entryType: LedgerEntryType;
  direction: LedgerDirection;
  amount: number;
  pspAmount?: number | null;
  status?: LedgerStatus;
  paymentRef?: string | null;
  pesapalTrackingId?: string | null;
  notes?: string | null;
};

/**
 * Write one entry. Upsert on (contribution_id, entry_type), so a repeat call
 * replaces rather than duplicates: a refund that first failed and then
 * succeeded flips its row from failed to posted instead of leaving two.
 */
async function writeEntry(
  entry: EntryWrite
): Promise<{ ok: boolean; unavailable: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from(TABLE).upsert({
      pool_id: entry.poolId,
      pool_kind: entry.poolKind,
      contribution_id: entry.contributionId,
      entry_type: entry.entryType,
      direction: entry.direction,
      amount: entry.amount,
      psp_amount: entry.pspAmount ?? null,
      status: entry.status ?? "posted",
      payment_ref: entry.paymentRef ?? null,
      pesapal_tracking_id: entry.pesapalTrackingId ?? null,
      notes: entry.notes ?? null,
    }, { onConflict: "contribution_id,entry_type" });

    if (error) {
      return {
        ok: false,
        unavailable: isSchemaMissing(error),
        error: error.message,
      };
    }
    return { ok: true, unavailable: false };
  } catch (e) {
    return { ok: false, unavailable: false, error: (e as Error).message };
  }
}

/** Credit a verified contribution. Safe to call any number of times. */
export function postContributionEntry(
  entry: Omit<EntryWrite, "entryType" | "direction">
) {
  return writeEntry({ ...entry, entryType: "contribution", direction: "credit" });
}

/** Debit a refunded contribution. Safe to call any number of times. */
export function postRefundEntry(
  entry: Omit<EntryWrite, "entryType" | "direction">
) {
  return writeEntry({ ...entry, entryType: "refund", direction: "debit" });
}

async function fetchEntries(poolId: string, poolKind: PoolKind) {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("pool_id", poolId)
      .eq("pool_kind", poolKind)
      .order("created_at", { ascending: true });

    if (error) return { entries: null as LedgerEntry[] | null, unavailable: isSchemaMissing(error) };
    return { entries: (data ?? []) as LedgerEntry[], unavailable: false };
  } catch {
    return { entries: null as LedgerEntry[] | null, unavailable: true };
  }
}

/** The ledger's net position: posted credits minus posted debits. */
function netOf(entries: LedgerEntry[]) {
  return entries.reduce((sum, e) => {
    if (e.status !== "posted") return sum;
    return sum + (e.direction === "credit" ? num(e.amount) : -num(e.amount));
  }, 0);
}

/** Sum of verified contributions — what the pre-ledger code did. */
async function legacyBalance(poolId: string, poolKind: PoolKind): Promise<number> {
  const table =
    poolKind === "consumer" ? "pool_contributions" : "corporate_pool_contributions";
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("amount")
      .eq("pool_id", poolId)
      .eq("is_verified", true);

    if (error) return 0;
    return (data ?? []).reduce((sum, row) => sum + num(row.amount), 0);
  } catch {
    return 0;
  }
}

export type ResolvedBalance = {
  balance: number;
  /** Which source produced the number — surfaced for debugging, not for UI. */
  source: "ledger" | "contributions";
  ledgerAvailable: boolean;
  entries: LedgerEntry[];
};

/**
 * Resolve a pool's balance.
 *
 * Ledger first. If the ledger has nothing for this pool — migration not run,
 * or a pool whose contributions all predate it and did not backfill — fall
 * back to summing verified contributions rather than reporting zero. Money
 * that exists must never be hidden by a missing table.
 */
export async function resolvePoolBalance(
  poolId: string,
  poolKind: PoolKind
): Promise<ResolvedBalance> {
  const { entries, unavailable } = await fetchEntries(poolId, poolKind);

  if (entries) {
    const postedContributions = entries.filter((e) => e.entry_type === "contribution").length;
    if (postedContributions > 0) {
      return {
        balance: netOf(entries),
        source: "ledger",
        ledgerAvailable: true,
        entries,
      };
    }
    // Ledger exists but is empty for this pool: it may still be a pool with
    // no money yet, so fall through and compare against contributions.
  }

  const legacy = await legacyBalance(poolId, poolKind);
  return {
    balance: legacy,
    source: entries && entries.length === 0 && legacy === 0 ? "ledger" : "contributions",
    ledgerAvailable: !unavailable,
    entries: entries ?? [],
  };
}

export type RefundSummary = {
  refundedCount: number;
  refundedAmount: number;
  failedCount: number;
};

/** Refund totals from posted debits — the money that actually went back. */
export function refundSummary(entries: LedgerEntry[]): RefundSummary {
  let refundedCount = 0;
  let refundedAmount = 0;
  let failedCount = 0;

  for (const e of entries) {
    if (e.entry_type !== "refund") continue;
    if (e.status === "posted") {
      refundedCount += 1;
      refundedAmount += num(e.amount);
    } else {
      failedCount += 1;
    }
  }

  return { refundedCount, refundedAmount, failedCount };
}

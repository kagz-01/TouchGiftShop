import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Mail } from "lucide-react";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalState from "@/components/corporate/portal/PortalState";
import PortalOrderTimeline from "@/components/corporate/portal/PortalOrderTimeline";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type CorporateOrder = {
  id: string;
  status: string;
  company_name: string | null;
  sender_name: string;
  sender_phone: string;
  custom_message: string | null;
  gift_wrap: string | null;
  recipient_count: number | null;
  subtotal: number | null;
  bulk_discount_percent: number | null;
  bulk_discount_amount: number | null;
  wrap_surcharge: number | null;
  total_amount: number | null;
  delivery_date: string | null;
  payment_method: string | null;
  created_at: string;
  notes: string | null;
};

type Recipient = {
  id: string;
  recipient_name: string;
  status: string;
  order_id: string | null;
};

const ORDER_STATUS: Record<string, string> = {
  draft: "Draft",
  pending_payment: "Awaiting payment",
  processing: "In production",
  wrapped: "Wrapped",
  dispatched: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const ORDER_COLOUR: Record<string, string> = {
  draft: "var(--portal-text-faint)",
  pending_payment: "var(--portal-warn)",
  processing: "var(--portal-accent)",
  wrapped: "var(--portal-accent)",
  dispatched: "var(--portal-accent)",
  delivered: "var(--portal-positive)",
  cancelled: "var(--portal-stop)",
  refunded: "var(--portal-stop)",
};

const money = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
const date = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

export default async function PortalOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getCorporateSession();
  if (!auth.ok && auth.reason === "signed_out") {
    redirect("/corporate/portal/sign-in?next=/corporate/portal/orders");
  }
  if (!auth.ok) {
    return (
      <PortalShell companyName="TouchGift" contactName={null} contactEmail="">
        <PortalState
          kind={auth.reason === "unavailable" ? "error" : "no-access"}
          title={auth.reason === "unavailable" ? "We could not load your account" : "No company account is linked to this sign-in"}
          body={auth.reason === "unavailable" ? "This is usually a brief connection problem. Try again in a moment." : "Ask your account manager to invite the email address you signed in with."}
        />
      </PortalShell>
    );
  }

  const { session } = auth;
  const { id } = await params;

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /* Scoped to the account as well as the id. A client who guesses another
     company's order id gets the same 404 as a missing one. */
  const { data: order } = await db
    .from("corporate_orders")
    .select("*")
    .eq("id", id)
    .eq("corporate_account_id", session.account.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: recipients } = await db
    .from("corporate_order_recipients")
    .select("id, recipient_name, status, order_id")
    .eq("corporate_order_id", order.id)
    .order("recipient_name", { ascending: true });

  const rows: Recipient[] = recipients ?? [];
  const o = order as unknown as CorporateOrder;
  const showMoney = canSeeFinancials(session.membership.role);

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <Link
        href="/corporate/portal/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--portal-text-muted)] transition-colors hover:text-[color:var(--portal-text)]"
      >
        <ChevronLeft className="h-4 w-4" /> All orders
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold leading-tight">
            {o.recipient_count ? `${o.recipient_count} recipients` : "Order"}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--portal-text-faint)]">
            Placed {date(o.created_at)}
            {o.delivery_date ? ` · for ${date(o.delivery_date)}` : ""}
          </p>
        </div>
        <span
          className="portal-status"
          style={{ color: ORDER_COLOUR[o.status] ?? "var(--portal-text-faint)" }}
        >
          {ORDER_STATUS[o.status] ?? o.status}
        </span>
      </header>

      <div className="portal-card p-6 sm:p-8">
        <PortalOrderTimeline status={o.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="portal-card p-6">
            <h2 className="font-display mb-4 text-lg font-bold">Recipients</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-[color:var(--portal-text-muted)]">
                This order was placed without a recipient list. Ask your account
                manager for the delivery schedule.
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0 truncate text-sm">{r.recipient_name}</span>
                    <span
                      className="portal-status shrink-0"
                      style={{ color: ORDER_COLOUR[r.status] ?? "var(--portal-text-faint)" }}
                    >
                      {ORDER_STATUS[r.status] ?? r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(o.custom_message || o.gift_wrap) && (
            <section className="portal-card p-6">
              <h2 className="font-display mb-3 text-lg font-bold">Gift details</h2>
              {o.custom_message && (
                <p className="text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                  {o.custom_message}
                </p>
              )}
              <p className="mt-3 text-xs text-[color:var(--portal-text-faint)]">
                Wrapping: {o.gift_wrap ?? "standard"}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {showMoney && (
            <section className="portal-card p-6">
              <h2 className="font-display mb-4 text-lg font-bold">Cost</h2>
              <dl className="space-y-2.5">
                <Line label="Subtotal" value={money(Number(o.subtotal ?? 0))} />
                {Number(o.wrap_surcharge) > 0 && (
                  <Line label="Wrapping" value={money(Number(o.wrap_surcharge))} />
                )}
                {Number(o.bulk_discount_amount) > 0 && (
                  <Line
                    label={`Bulk discount (${o.bulk_discount_percent ?? 0}%)`}
                    value={`− ${money(Number(o.bulk_discount_amount))}`}
                    positive
                  />
                )}
                <Line
                  label="Total"
                  value={money(Number(o.total_amount ?? 0))}
                  emphasis
                />
              </dl>
              {o.payment_method && (
                <p className="mt-4 text-xs text-[color:var(--portal-text-faint)]">
                  Settled through PesaPal
                </p>
              )}
            </section>
          )}

          <section className="portal-card p-6">
            <h2 className="font-display mb-2 text-lg font-bold">Documents</h2>
            <p className="text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
              Invoices and delivery notes are issued by your account manager. Ask and
              it will arrive the same day.
            </p>
            <a
              href={`mailto:corporate@touchgift.co.ke?subject=${encodeURIComponent(
                `Invoice request — ${o.recipient_count ?? ""} gifts placed ${date(o.created_at)}`
              )}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-muted)" }}
            >
              <Mail className="h-4 w-4" /> Request an invoice
            </a>
          </section>
        </div>
      </div>
    </PortalShell>
  );
}

function Line({
  label,
  value,
  positive,
  emphasis,
}: {
  label: string;
  value: string;
  positive?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-[color:var(--portal-text-muted)]">{label}</dt>
      <dd
        className={`tabular-nums ${emphasis ? "text-lg font-semibold" : "text-sm"}`}
        style={{ color: positive ? "var(--portal-positive)" : "var(--portal-text)" }}
      >
        {value}
      </dd>
    </div>
  );
}

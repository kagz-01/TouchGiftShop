import Link from "next/link";
import { redirect } from "next/navigation";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  recipient_count: number | null;
  subtotal: number | null;
  total_amount: number | null;
  delivery_date: string | null;
  created_at: string;
};

/* Mirrors corporate_order_status, in words a buyer uses. */
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

export default async function PortalOrdersPage() {
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
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await db
    .from("corporate_orders")
    .select("id, status, recipient_count, subtotal, total_amount, delivery_date, created_at")
    .eq("corporate_account_id", session.account.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const orders: OrderRow[] = data ?? [];
  const showMoney = canSeeFinancials(session.membership.role);

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">Orders</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          Bulk and hamper orders placed by {session.account.company_name}.
        </p>
      </header>

      {orders.length === 0 ? (
        <PortalState
          kind="empty"
          title="No orders yet"
          body="When you place a bulk or hamper order it will appear here with its delivery status. For now, send us a roster and we will quote it first."
          action={{ href: "/corporate/bulk-upload", label: "Send a roster" }}
          secondaryAction={{ href: "/corporate/build", label: "Build a hamper" }}
        />
      ) : (
        <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {o.recipient_count ? `${o.recipient_count} recipients` : "Order"}
                </span>
                <span className="mt-0.5 block text-xs text-[color:var(--portal-text-faint)]">
                  Placed {date(o.created_at)}
                  {o.delivery_date ? ` · for ${date(o.delivery_date)}` : ""}
                </span>
              </span>
              {showMoney && o.total_amount != null && (
                <span className="text-sm tabular-nums text-[color:var(--portal-text-muted)]">
                  {money(Number(o.total_amount))}
                </span>
              )}
              <span className="portal-status" style={{ color: ORDER_COLOUR[o.status] ?? "var(--portal-text-faint)" }}>
                {ORDER_STATUS[o.status] ?? o.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-[color:var(--portal-text-faint)]">
        Need a copy of an invoice or a delivery note?{" "}
        <Link href="mailto:corporate@touchgift.co.ke" className="text-[color:var(--portal-accent)] hover:underline">
          Ask your account manager
        </Link>{" "}
        — we will send it the same day.
      </p>
    </PortalShell>
  );
}

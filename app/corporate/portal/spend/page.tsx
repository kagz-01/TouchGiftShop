import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalPreviewGate from "@/components/corporate/portal/PortalPreviewGate";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  total_amount: number | null;
  bulk_discount_amount: number | null;
  subtotal: number | null;
  created_at: string;
};

const money = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
const month = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export default async function PortalSpendPage() {
  const auth = await getCorporateSession();
  if (!auth.ok && auth.reason === "signed_out") {
    return (
      <PortalShell preview companyName="TouchGift" contactName={null} contactEmail="">
        <PortalPreviewGate
          title="Spend"
          intro="Committed spend, discounts earned and quotes awaiting a decision."
          locked
          bodyTitle="Sign in to see spend"
          body="This area is financial data for your company, so it opens only for a signed-in member of the account. Owner and member roles see figures; viewers see quotes and orders without spend."
          next="/corporate/portal/spend"
        />
      </PortalShell>
    );
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

  if (!canSeeFinancials(session.membership.role)) {
    return (
      <PortalShell
        companyName={session.account.company_name}
        contactName={session.name}
        contactEmail={session.email}
      >
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold leading-tight">Spend</h1>
        </header>
        <PortalState
          kind="no-access"
          title="Spend is not part of your role"
          body="Your sign-in can see quotes and orders. Ask an account owner if you need financial figures as well."
        />
      </PortalShell>
    );
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [ordersRes, quotesRes] = await Promise.all([
    db
      .from("corporate_orders")
      .select("id, status, total_amount, bulk_discount_amount, subtotal, created_at")
      .eq("corporate_account_id", session.account.id)
      .order("created_at", { ascending: false })
      .limit(500),
    db
      .from("corporate_quote_requests")
      .select("quoted_amount, total_estimate, status")
      .eq("corporate_account_id", session.account.id),
  ]);

  const orders: OrderRow[] = ordersRes.data ?? [];
  const quotes = quotesRes.data ?? [];

  // Cancelled and refunded orders are not spend. Counting them would overstate
  // what the company actually bought.
  const counted = orders.filter((o) => !["cancelled", "refunded", "draft"].includes(o.status));
  const lifetime = counted.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
  const discounts = counted.reduce((sum, o) => sum + Number(o.bulk_discount_amount ?? 0), 0);
  const openQuotes = quotes.filter((q) => q.status === "quoted").length;
  const pendingValue = quotes
    .filter((q) => q.status === "quoted")
    .reduce((sum, q) => sum + Number(q.quoted_amount ?? q.total_estimate ?? 0), 0);

  const byMonth = new Map<string, number>();
  for (const o of counted) {
    const key = month(o.created_at);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(o.total_amount ?? 0));
  }
  const months = [...byMonth.entries()].reverse();
  const max = Math.max(...months.map(([, v]) => v), 1);

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">Spend</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          What {session.account.company_name} has committed, and what is still open.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Committed to date" value={money(lifetime)} />
        <Stat label="Bulk discounts earned" value={money(discounts)} />
        <Stat label="Open quotes" value={String(openQuotes)} />
        <Stat label="Awaiting your decision" value={money(pendingValue)} />
      </div>

      {months.length === 0 ? (
        <div className="mt-8">
          <PortalState
            kind="empty"
            title="Nothing to chart yet"
            body="Once an order is placed it appears here, month by month. No order, no chart — we would rather show nothing than a flat line that looks like a trend."
            action={{ href: "/corporate/catalog", label: "Browse the corporate catalog" }}
          />
        </div>
      ) : (
        <section className="mt-8">
          <h2 className="font-display mb-4 text-xl font-bold">By month</h2>
          <ul className="portal-card space-y-4 p-5">
            {months.map(([label, value]) => (
              <li key={label}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-[color:var(--portal-text-muted)]">{label}</span>
                  <span className="text-sm font-medium tabular-nums">{money(value)}</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ background: "var(--portal-surface-2)" }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${Math.max((value / max) * 100, 2)}%`,
                      background: "var(--portal-accent)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PortalShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="portal-card p-5">
      <p className="text-xs text-[color:var(--portal-text-faint)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none tabular-nums tracking-tight sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, Package, Sparkles } from "lucide-react";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";


export const dynamic = "force-dynamic";

/* The Supabase client infers nothing through the service-role key, so the two
   projections this page reads are declared rather than `any`. */
type QuoteSummary = {
  id: string;
  reference: string | null;
  product_name: string;
  quantity: number;
  status: string;
  quoted_amount: number | null;
  total_estimate: number | null;
  valid_until: string | null;
  created_at: string;
};

type OrderSummary = {
  id: string;
  total_amount: number | null;
  status: string;
  created_at: string;
};

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function PortalOverviewPage() {
  const auth = await getCorporateSession();

  if (!auth.ok && auth.reason === "signed_out") {
    redirect("/corporate/portal/sign-in?next=/corporate/portal");
  }

  if (!auth.ok && auth.reason === "unavailable") {
    return (
      <PortalShell companyName="TouchGift" contactName={null} contactEmail="">
        <PortalState
          kind="error"
          title="We could not load your account"
          body="This is usually a brief connection problem. Try again in a moment."
        />
      </PortalShell>
    );
  }

  if (!auth.ok) {
    return (
      <PortalShell companyName="TouchGift" contactName={null} contactEmail="">
        <PortalState
          kind="no-access"
          title="No company account is linked to this sign-in"
          body="Access is granted by your account manager. If you expected to see your company here, ask them to invite this email address — it has to match the one you signed in with."
          action={{ href: "mailto:corporate@touchgift.co.ke?subject=Portal%20access", label: "Email your account manager" }}
        />
      </PortalShell>
    );
  }

  const { session } = auth;
  const db = supabase();

  /* Everything below is read straight from the database. No default figures, no
     "typical spend", no trend line drawn through an empty series. */
  const [quotesRes, ordersRes] = await Promise.all([
    db
      .from("corporate_quote_requests")
      .select("id, reference, product_name, quantity, status, quoted_amount, total_estimate, valid_until, created_at")
      .eq("corporate_account_id", session.account.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("corporate_orders")
      .select("id, total_amount, status, created_at")
      .eq("corporate_account_id", session.account.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const quotes: QuoteSummary[] = quotesRes.data ?? [];
  const orders: OrderSummary[] = ordersRes.data ?? [];
  const showMoney = canSeeFinancials(session.membership.role);

  const awaitingClient = quotes.filter((q) => q.status === "quoted").length;
  const openQuotes = quotes.filter((q) => q.status === "pending" || q.status === "quoted").length;
  const inFlight = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length;
  const committed = orders
    .filter((o) => ["processing", "wrapped", "dispatched", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

  const firstName = (session.name ?? session.email).split(/[\s@]/)[0];

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-8">
        <p className="text-xs text-[color:var(--portal-text-faint)]">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold leading-tight sm:text-4xl">
          {greeting()}, {firstName}
        </h1>
      </header>

      {awaitingClient > 0 ? (
        <Link
          href="/corporate/portal/quotes?status=quoted"
          className="mb-8 flex items-center gap-4 rounded-2xl border p-5 transition-colors"
          style={{
            background: "var(--portal-accent-tint)",
            borderColor: "var(--portal-accent)",
          }}
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--portal-surface)]">
            <Sparkles className="h-4 w-4 text-[color:var(--portal-accent)]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              {awaitingClient === 1
                ? "A quote is waiting for your decision"
                : `${awaitingClient} quotes are waiting for your decision`}
            </span>
            <span className="block text-sm text-[color:var(--portal-text-muted)]">
              Review the pricing and accept or decline — it takes one step.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-[color:var(--portal-accent)]" />
        </Link>
      ) : null}

      {/* Numbers, all real. A viewer role does not see money at all. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open quotes" value={String(openQuotes)} href="/corporate/portal/quotes" />
        {showMoney ? (
          <Stat label="Committed spend" value={formatMoney(committed)} />
        ) : (
          <Stat label="Committed spend" value="Hidden" muted note="Your role does not include spend" />
        )}
        <Stat label="Orders in progress" value={String(inFlight)} href="/corporate/portal/orders" />
        <Stat label="Total quotes" value={String(quotes.length)} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Recent quotes</h2>
          <Link
            href="/corporate/portal/quotes"
            className="text-sm text-[color:var(--portal-accent)] hover:underline"
          >
            View all
          </Link>
        </div>

        {quotes.length === 0 ? (
          <PortalState
            kind="empty"
            title="No quotes yet"
            body="When you request pricing for a product or bulk order, it will appear here with a reference you can quote back to us."
            action={{ href: "/corporate/catalog", label: "Browse the corporate catalog" }}
          />
        ) : (
          <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
            {quotes.slice(0, 5).map((q) => (
              <li key={q.id}>
                <Link
                  href={`/corporate/portal/quotes?open=${q.reference ?? q.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[color:var(--portal-surface-2)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{q.product_name}</span>
                    <span className="mt-0.5 block text-xs text-[color:var(--portal-text-faint)]">
                      {q.reference ?? "—"} · {q.quantity} units
                    </span>
                  </span>
                  <span className="hidden text-sm tabular-nums text-[color:var(--portal-text-muted)] sm:block">
                    {showMoney ? moneyCell(q) : "—"}
                  </span>
                  <span className="portal-status w-28 justify-end" style={{ color: statusColour(q.status) }}>
                    {statusLabel(q.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!orders.length && !quotes.length ? (
        <section className="mt-10">
          <PortalState
            kind="empty"
            title="Nothing to track yet"
            body="Your account is set up and ready. Send us your first request and it will show up here within minutes."
            action={{ href: "/corporate/bulk-upload", label: "Send a roster for bulk gifting" }}
          />
        </section>
      ) : null}
    </PortalShell>
  );
}

function Stat({
  label,
  value,
  href,
  note,
  muted,
}: {
  label: string;
  value: string;
  href?: string;
  note?: string;
  muted?: boolean;
}) {
  const body = (
    <div className="portal-card h-full p-5">
      <p className="text-xs text-[color:var(--portal-text-faint)]">{label}</p>
      <p
        className="mt-2 text-2xl font-semibold leading-none tabular-nums tracking-tight sm:text-3xl"
        style={{ color: muted ? "var(--portal-text-faint)" : "var(--portal-text)" }}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-[11px] text-[color:var(--portal-text-faint)]">{note}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {body}
    </Link>
  ) : (
    body
  );
}

const formatMoney = (n: number) =>
  `KES ${Math.round(n).toLocaleString("en-KE")}`;

/* No amount yet is not zero. Printing "KES 0" for a quote nobody has priced is
   a real number and it is a lie. */
const moneyCell = (q: QuoteSummary) => {
  if (q.quoted_amount != null) return formatMoney(q.quoted_amount);
  if (q.total_estimate != null) return `~${formatMoney(q.total_estimate)}`;
  return "Awaiting pricing";
};

import { statusLabel, statusColour } from "@/lib/portal-status";
  ({
    pending: "var(--portal-text-faint)",
    quoted: "var(--portal-accent)",
    accepted: "var(--portal-positive)",
    declined: "var(--portal-stop)",
  })[status] ?? "var(--portal-text-faint)";

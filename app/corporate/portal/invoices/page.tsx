import Link from "next/link";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalPreviewGate from "@/components/corporate/portal/PortalPreviewGate";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_slug: string | null;
  status: string;
  total_amount: number;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
};

const money = (n: number) => `KES ${Math.round(Number(n)).toLocaleString("en-KE")}`;
const date = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function PortalInvoicesPage() {
  const auth = await getCorporateSession();
  if (!auth.ok && auth.reason === "signed_out") {
    return (
      <PortalShell preview companyName="TouchGift" contactName={null} contactEmail="">
        <PortalPreviewGate
          title="Invoices"
          intro="Every invoice we have issued, printable as a PDF for your finance team."
          locked={false}
          bodyTitle="Preview: your invoices live here"
          body="Invoices land here the moment they are issued, each with its number, due date and status. A guest cannot see any document — sign in to reach your company's."
          primaryAction={{ href: "/corporate#packs", label: "Get a proforma instead" }}
          next="/corporate/portal/invoices"
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
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await db
    .from("corporate_invoices")
    .select("id, invoice_number, invoice_slug, status, total_amount, issued_at, due_at, paid_at")
    .eq("corporate_account_id", session.account.id)
    /* Drafts are a working document ops assembles, not something a client has
       been sent. */
    .neq("status", "draft")
    .order("issued_at", { ascending: false })
    .limit(100);

  const invoices: Invoice[] = data ?? [];
  const outstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "void")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">Invoices</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          Every invoice we have issued to {session.account.company_name}. Each one can be
          printed or saved as a PDF for your finance team.
        </p>
      </header>

      {invoices.length > 0 && (
        <div className="portal-card mb-6 p-5">
          <p className="text-xs text-[color:var(--portal-text-faint)]">Outstanding</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {money(outstanding)}
          </p>
          {outstanding > 0 && (
            <p className="mt-1.5 text-xs text-[color:var(--portal-text-muted)]">
              Settle through Paystack and we are notified automatically — quote the invoice
              number in the description.
            </p>
          )}
        </div>
      )}

      {invoices.length === 0 ? (
        <PortalState
          kind="empty"
          title="No invoices yet"
          body="An invoice is raised once an order goes out, and lands here the moment it is issued. If you need a proforma invoice for an order still being prepared, ask your account manager."
        />
      ) : (
        <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
          {invoices.map((i) => (
            <li key={i.id}>
              <Link
                href={`/corporate/portal/invoices/${i.invoice_slug}`}
                className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-[color:var(--portal-surface-2)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-sm font-medium">{i.invoice_number}</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--portal-text-faint)]">
                    Issued {date(i.issued_at)}
                    {i.due_at ? ` · due ${date(i.due_at)}` : ""}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-[color:var(--portal-text-muted)]">
                  {money(i.total_amount)}
                </span>
                <span
                  className="portal-status"
                  style={{
                    color:
                      i.status === "paid"
                        ? "var(--portal-positive)"
                        : i.status === "void"
                        ? "var(--portal-stop)"
                        : "var(--portal-accent)",
                  }}
                >
                  {i.status === "paid" ? "Paid" : i.status === "void" ? "Void" : "Outstanding"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
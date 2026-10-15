import { redirect } from "next/navigation";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession } from "@/lib/corporate-auth";

export const dynamic = "force-dynamic";

const ROLE_COPY: Record<string, string> = {
  owner: "You can see everything, including spend and credit.",
  member: "You can see quotes, orders and spend.",
  viewer: "You can see quotes and orders. Spend is hidden.",
};

export default async function PortalSettingsPage() {
  const auth = await getCorporateSession();
  if (!auth.ok && auth.reason === "signed_out") {
    redirect("/corporate/portal/sign-in?next=/corporate/portal/settings");
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
  const { account, membership } = session;

  return (
    <PortalShell
      companyName={account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">Settings</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          Your account details and how you are signed in.
        </p>
      </header>

      <div className="max-w-2xl space-y-4">
        <section className="portal-card p-6">
          <h2 className="font-display text-lg font-bold">Your sign-in</h2>
          <dl className="mt-4 space-y-3">
            <Row label="Name" value={session.name ?? "Not set"} />
            <Row label="Email" value={session.email} />
            <Row label="Role" value={membership.role} />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-[color:var(--portal-text-faint)]">
            {ROLE_COPY[membership.role]}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[color:var(--portal-text-faint)]">
            To change what you can see, or to change the address you sign in with, ask
            your account manager — access changes are recorded against the account.
          </p>
        </section>

        <section className="portal-card p-6">
          <h2 className="font-display text-lg font-bold">Company</h2>
          <dl className="mt-4 space-y-3">
            <Row label="Name" value={account.company_name} />
            <Row label="Industry" value={account.industry ?? "Not set"} />
            <Row label="Team size" value={account.employee_count ? `${account.employee_count}` : "Not set"} />
            <Row
              label="Payment terms"
              value={
                account.default_payment_terms === "net_30"
                  ? "Net 30 days"
                  : account.default_payment_terms === "net_60"
                  ? "Net 60 days"
                  : "Pay on order"
              }
            />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-[color:var(--portal-text-faint)]">
            Something here wrong? Your account manager keeps these details — they are
            what appear on your invoices.
          </p>
        </section>

        <section className="portal-card p-6">
          <h2 className="font-display text-lg font-bold">Need something changed?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
            Billing details, delivery addresses, a new account manager, or a colleague
            who needs access — one email and it is handled.
          </p>
          <a
            href="mailto:corporate@touchgift.co.ke?subject=Corporate%20account%20request"
            className="mt-4 inline-block rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
          >
            Email your account manager
          </a>
        </section>
      </div>
    </PortalShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b pb-3 last:border-0" style={{ borderColor: "var(--portal-border-soft)" }}>
      <dt className="text-xs text-[color:var(--portal-text-faint)]">{label}</dt>
      <dd className="truncate text-sm">{value}</dd>
    </div>
  );
}

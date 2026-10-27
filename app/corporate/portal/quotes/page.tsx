import { Suspense } from "react";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalPreviewGate from "@/components/corporate/portal/PortalPreviewGate";
import PortalState from "@/components/corporate/portal/PortalState";
import PortalQuotesClient from "@/components/corporate/portal/PortalQuotesClient";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";

export const dynamic = "force-dynamic";

export default async function PortalQuotesPage() {
  const auth = await getCorporateSession();

  if (!auth.ok && auth.reason === "signed_out") {
    return (
      <PortalShell preview companyName="TouchGift" contactName={null} contactEmail="">
        <PortalPreviewGate
          title="Quotes"
          intro="Pricing we send you, with a reference you can quote back to us."
          locked={false}
          bodyTitle="Preview: your quotes live here"
          body="Every quote appears here with its reference and validity date, and you accept or decline in one step. A guest sees the shape of it; your company's quotes need a sign-in."
          primaryAction={{ href: "/corporate/catalog", label: "Browse the catalog instead" }}
          next="/corporate/portal/quotes"
        />
      </PortalShell>
    );
  }
  if (!auth.ok) {
    return (
      <PortalShell companyName="TouchGift" contactName={null} contactEmail="">
        <PortalState
          kind={auth.reason === "unavailable" ? "error" : "no-access"}
          title={
            auth.reason === "unavailable"
              ? "We could not load your account"
              : "No company account is linked to this sign-in"
          }
          body={
            auth.reason === "unavailable"
              ? "This is usually a brief connection problem. Try again in a moment."
              : "Ask your account manager to invite the email address you signed in with."
          }
        />
      </PortalShell>
    );
  }

  const { session } = auth;

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <Suspense fallback={<div className="portal-card h-40 animate-pulse" />}>
        <PortalQuotesClient
          canSeeMoney={canSeeFinancials(session.membership.role)}
          accountName={session.account.company_name}
        />
      </Suspense>
    </PortalShell>
  );
}

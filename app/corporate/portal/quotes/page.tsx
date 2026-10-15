import { Suspense } from "react";
import { redirect } from "next/navigation";
import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalState from "@/components/corporate/portal/PortalState";
import PortalQuotesClient from "@/components/corporate/portal/PortalQuotesClient";
import { getCorporateSession, canSeeFinancials } from "@/lib/corporate-auth";

export const dynamic = "force-dynamic";

export default async function PortalQuotesPage() {
  const auth = await getCorporateSession();

  if (!auth.ok && auth.reason === "signed_out") {
    redirect("/corporate/portal/sign-in?next=/corporate/portal/quotes");
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

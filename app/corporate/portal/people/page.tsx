import PortalShell from "@/components/corporate/portal/PortalShell";
import PortalPreviewGate from "@/components/corporate/portal/PortalPreviewGate";
import PortalState from "@/components/corporate/portal/PortalState";
import { getCorporateSession } from "@/lib/corporate-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Member = {
  id: string;
  email: string;
  role: string;
  status: string;
  full_name: string | null;
  job_title: string | null;
  last_seen_at: string | null;
};

type Recipient = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  tier: string | null;
  birthday: string | null;
};

export default async function PortalPeoplePage() {
  const auth = await getCorporateSession();
  if (!auth.ok && auth.reason === "signed_out") {
    return (
      <PortalShell preview companyName="TouchGift" contactName={null} contactEmail="">
        <PortalPreviewGate
          title="People"
          intro="Who can use this portal, and who you send gifts to."
          locked
          bodyTitle="Sign in to see people"
          body="Members, roles and your saved recipient roster are account data, so they open only for a signed-in member. Access itself is invited by your TouchGift account manager."
          primaryAction={{ href: "/corporate/bulk-upload", label: "Upload a roster" }}
          next="/corporate/portal/people"
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

  const [membersRes, recipientsRes] = await Promise.all([
    db
      .from("corporate_account_members")
      .select("id, email, role, status, full_name, job_title, last_seen_at")
      .eq("corporate_account_id", session.account.id)
      .neq("status", "revoked")
      .order("created_at", { ascending: true }),
    db
      .from("client_profiles")
      .select("id, name, role, email, tier, birthday")
      .eq("corporate_account_id", session.account.id)
      .order("name", { ascending: true })
      .limit(200),
  ]);

  /* `notes`, `relationship_strength` and the internal scoring columns are not
     selected at all — a client sees their own people, not our read on them. */
  const members: Member[] = membersRes.data ?? [];
  const recipients: Recipient[] = recipientsRes.data ?? [];

  const roleLabel: Record<string, string> = {
    owner: "Owner",
    member: "Member",
    viewer: "Viewer",
  };

  return (
    <PortalShell
      companyName={session.account.company_name}
      contactName={session.name}
      contactEmail={session.email}
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">People</h1>
        <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">
          Who at {session.account.company_name} can use this portal, and who you send gifts to.
        </p>
      </header>

      <section>
        <h2 className="font-display mb-4 text-xl font-bold">Portal access</h2>
        {members.length === 0 ? (
          <PortalState
            kind="empty"
            title="Nobody else has access"
            body="Your account manager can invite a colleague so they can see the same quotes and orders."
          />
        ) : (
          <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {m.full_name ?? m.email}
                    {m.id === session.membership.id && (
                      <span className="ml-2 text-xs text-[color:var(--portal-text-faint)]">you</span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[color:var(--portal-text-faint)]">
                    {m.email}
                    {m.job_title ? ` · ${m.job_title}` : ""}
                  </span>
                </span>
                <span className="text-xs text-[color:var(--portal-text-muted)]">
                  {roleLabel[m.role] ?? m.role}
                </span>
                <span className="portal-status" style={{ color: "var(--portal-text-faint)" }}>
                  {m.status === "active" ? "Active" : "Invited"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-[color:var(--portal-text-faint)]">
          Access is granted by your TouchGift account manager. Viewers see quotes and
          orders but no spend.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display mb-4 text-xl font-bold">Recipients</h2>
        {recipients.length === 0 ? (
          <PortalState
            kind="empty"
            title="No recipients saved yet"
            body="Upload a roster and we will build it into your people list, ready for milestone gifting next year."
            action={{ href: "/corporate/bulk-upload", label: "Upload a roster" }}
          />
        ) : (
          <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
            {recipients.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-[color:var(--portal-text-faint)]">
                    {[r.role, r.email].filter(Boolean).join(" · ") || "No contact details yet"}
                  </span>
                </span>
                {r.birthday && (
                  <span className="text-xs text-[color:var(--portal-text-muted)]">
                    Birthday {new Date(r.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PortalShell>
  );
}

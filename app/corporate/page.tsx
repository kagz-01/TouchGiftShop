import { redirect } from "next/navigation";

/**
 * HCI rationale: The corporate "homepage" was a marketing page for users who
 * were already on the platform. Anyone clicking "Corporate" knows they want to
 * manage gifting — not read about it. Direct entry into the dashboard
 * eliminates one navigation hop (Fitts' Law + cognitive load reduction) and
 * places them immediately inside their workspace.
 *
 * Progressive disclosure is preserved: the dashboard Overview tab gives full
 * orientation before any action is required.
 */
export default function CorporateHomePage() {
  redirect("/corporate/dashboard");
}

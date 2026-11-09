import { redirect } from "next/navigation";

export default function CorporateMilestonesRedirect() {
  redirect("/corporate/dashboard?tab=milestones");
}

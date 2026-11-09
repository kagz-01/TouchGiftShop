import { redirect } from "next/navigation";

export default function CorporateMilestonesAddRedirect() {
  redirect("/corporate/dashboard?tab=milestones");
}

import { redirect } from "next/navigation";

export default function CorporateReportsRedirect() {
  redirect("/corporate/dashboard?tab=overview");
}

import { redirect } from "next/navigation";

export default function CorporateCalendarRedirect() {
  redirect("/corporate/dashboard?tab=calendar");
}

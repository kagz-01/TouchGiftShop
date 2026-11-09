import { redirect } from "next/navigation";

export default function CorporatePoolsRedirect() {
  redirect("/corporate/dashboard?tab=pools");
}

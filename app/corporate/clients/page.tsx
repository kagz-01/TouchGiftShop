import { redirect } from "next/navigation";

export default function CorporateClientsRedirect() {
  redirect("/corporate/dashboard?tab=clients");
}

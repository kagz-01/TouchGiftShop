import { redirect } from "next/navigation";

export default function BulkUploadRedirect() {
  redirect("/corporate/dashboard?tab=orders");
}

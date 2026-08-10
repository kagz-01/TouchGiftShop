import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import AccountClient from "@/components/account/AccountClient";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const phone = user.phone ?? null;
  const name = user.user_metadata?.full_name ?? null;
  const email = user.email ?? null;
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  return (
    <AccountClient
      userId={user.id}
      phone={phone}
      name={name}
      email={email}
      avatarUrl={avatarUrl}
    />
  );
}

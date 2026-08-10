import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OrdersClient from "./OrdersClient";

async function getOrders() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${base}/api/orders`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  if (res.status === 401) return [];
  if (!res.ok) return [];
  const { orders } = await res.json();
  return orders ?? [];
}

export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/orders");
  }

  const orders = await getOrders();

  return <OrdersClient initialOrders={orders} />;
}


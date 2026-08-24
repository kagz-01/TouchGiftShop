import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_API_KEY) {
    return false;
  }
  return true;
}

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  const validStatuses = [
    "pending_payment",
    "processing",
    "wrapped",
    "dispatched",
    "delivered",
    "failed",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

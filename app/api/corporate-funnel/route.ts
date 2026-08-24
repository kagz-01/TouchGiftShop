import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/corporate-funnel — track corporate crossover interest
export async function POST(req: Request) {
  const { sourcePage, action, email, phone, companyName } = await req.json();

  if (!action) {
    return NextResponse.json({ error: "Action required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("corporate_crossover_funnels")
    .insert({
      source_page: sourcePage || "unknown",
      action,
      email: email || null,
      phone: phone || null,
      company_name: companyName || null,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

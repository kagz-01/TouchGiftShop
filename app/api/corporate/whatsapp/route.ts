import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

// GET /api/corporate/whatsapp — Fetch flows
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  let query = supabaseAdmin.from("corporate_whatsapp_flows").select("*");
  if (accountId) {
    query = query.eq("corporate_account_id", accountId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ flows: data });
}

// POST /api/corporate/whatsapp — Create or update flow
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, flow_id, title, description, trigger_rule, message_template, is_enabled, corporate_account_id } = body;

    let result;
    if (id) {
      // Update
      const { data, error } = await supabaseAdmin
        .from("corporate_whatsapp_flows")
        .update({
          title,
          description,
          trigger_rule,
          message_template,
          is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from("corporate_whatsapp_flows")
        .insert({
          flow_id,
          title,
          description,
          trigger_rule,
          message_template,
          is_enabled,
          corporate_account_id: corporate_account_id || null
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ flow: result });
  } catch (error: any) {
    console.error("WhatsApp flow error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

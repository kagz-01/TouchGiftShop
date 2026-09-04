import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createRuleSchema = z.object({
  corporateAccountId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  triggerType: z.enum(["birthday", "work_anniversary", "promotion", "new_hire", "farewell", "holiday", "custom"]),
  giftBudget: z.number().positive(),
  giftProductId: z.string().uuid().optional(),
  giftTemplateId: z.string().uuid().optional(),
  customMessageTemplate: z.string().optional(),
  autoOrder: z.boolean().default(false),
  autoPool: z.boolean().default(false),
  notifyHr: z.boolean().default(true),
  sendWhatsapp: z.boolean().default(true),
  triggerDaysBefore: z.number().int().min(0).max(90).default(0),
  triggerTime: z.string().default("09:00:00"),
  escalationEnabled: z.boolean().default(false),
  escalationTiers: z
    .array(
      z.object({
        years: z.number().int().positive(),
        budget: z.number().positive(),
        templateId: z.string().uuid().optional(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const triggerType = searchParams.get("triggerType");

    let query = supabaseAdmin
      .from("milestone_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (accountId) {
      query = query.eq("corporate_account_id", accountId);
    }
    if (triggerType) {
      query = query.eq("trigger_type", triggerType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch milestone rules error:", error);
      return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
    }

    return NextResponse.json({ rules: data });
  } catch (error) {
    console.error("Milestones GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    const parsed = createRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const { data: rule, error } = await supabaseAdmin
      .from("milestone_rules")
      .insert({
        corporate_account_id: data.corporateAccountId || null,
        name: data.name,
        description: data.description || null,
        trigger_type: data.triggerType,
        gift_budget: data.giftBudget,
        gift_product_id: data.giftProductId || null,
        gift_template_id: data.giftTemplateId || null,
        custom_message_template: data.customMessageTemplate || null,
        auto_order: data.autoOrder,
        auto_pool: data.autoPool,
        notify_hr: data.notifyHr,
        send_whatsapp: data.sendWhatsapp,
        trigger_days_before: data.triggerDaysBefore,
        trigger_time: data.triggerTime,
        escalation_enabled: data.escalationEnabled,
        escalation_tiers: data.escalationTiers || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Create milestone rule error:", error);
      return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Milestones POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

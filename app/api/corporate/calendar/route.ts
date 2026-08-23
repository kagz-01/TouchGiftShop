import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createEventSchema = z.object({
  corporateAccountId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventDate: z.string().min(1),
  eventType: z.enum(["birthday", "work_anniversary", "promotion", "new_hire", "farewell", "holiday", "custom"]),
  recipientName: z.string().min(1).max(100),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  giftBudget: z.number().positive().optional(),
  giftProductId: z.string().uuid().optional(),
  giftTemplateId: z.string().uuid().optional(),
  customMessage: z.string().optional(),
  autoOrder: z.boolean().default(false),
  autoPool: z.boolean().default(false),
  reminderDaysBefore: z.number().int().min(0).max(90).default(7),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");

    let query = supabaseAdmin
      .from("corporate_calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (accountId) {
      query = query.eq("corporate_account_id", accountId);
    }
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
      query = query.gte("event_date", startDate).lt("event_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch calendar events error:", error);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const { data: event, error } = await supabaseAdmin
      .from("corporate_calendar_events")
      .insert({
        corporate_account_id: data.corporateAccountId || null,
        title: data.title,
        description: data.description || null,
        event_date: data.eventDate,
        event_type: data.eventType,
        recipient_name: data.recipientName,
        recipient_email: data.recipientEmail || null,
        recipient_phone: data.recipientPhone || null,
        department: data.department || null,
        role: data.role || null,
        gift_budget: data.giftBudget || null,
        gift_product_id: data.giftProductId || null,
        gift_template_id: data.giftTemplateId || null,
        custom_message: data.customMessage || null,
        auto_order: data.autoOrder,
        auto_pool: data.autoPool,
        reminder_days_before: data.reminderDaysBefore,
      })
      .select()
      .single();

    if (error) {
      console.error("Create calendar event error:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

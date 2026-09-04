import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createPoolSchema = z.object({
  corporateAccountId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  recipientName: z.string().min(1).max(100),
  recipientRole: z.string().optional(),
  recipientDepartment: z.string().optional(),
  occasion: z.string().min(1),
  targetAmount: z.number().positive(),
  minContribution: z.number().positive().default(200),
  deadline: z.string().min(1),
  companyMatch: z
    .object({
      enabled: z.boolean(),
      ratio: z.number().positive(),
      cap: z.number().positive(),
    })
    .optional(),
  showLeaderboard: z.boolean().default(true),
  autoReminders: z.boolean().default(true),
});

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "corp-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("corporate_gift_pools")
      .select("*")
      .order("created_at", { ascending: false });

    if (accountId) {
      query = query.eq("corporate_account_id", accountId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch corporate pools error:", error);
      return NextResponse.json({ error: "Failed to fetch pools" }, { status: 500 });
    }

    return NextResponse.json({ pools: data });
  } catch (error) {
    console.error("Corporate pools GET error:", error);
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
    const parsed = createPoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      corporateAccountId,
      title,
      description,
      recipientName,
      recipientRole,
      recipientDepartment,
      occasion,
      targetAmount,
      minContribution,
      deadline,
      companyMatch,
      showLeaderboard,
      autoReminders,
    } = parsed.data;

    const slug = generateSlug();

    const { data, error } = await supabaseAdmin
      .from("corporate_gift_pools")
      .insert({
        corporate_account_id: corporateAccountId || null,
        slug,
        title,
        description: description || null,
        recipient_name: recipientName,
        recipient_role: recipientRole || null,
        recipient_department: recipientDepartment || null,
        occasion,
        target_amount: targetAmount,
        min_contribution: minContribution,
        deadline: new Date(deadline).toISOString(),
        company_match_enabled: companyMatch?.enabled || false,
        company_match_ratio: companyMatch?.ratio || 1.0,
        company_match_cap: companyMatch?.cap || 5000,
        show_leaderboard: showLeaderboard,
        auto_reminders: autoReminders,
      })
      .select()
      .single();

    if (error) {
      console.error("Create corporate pool error:", error);
      return NextResponse.json({ error: "Failed to create pool" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
    const shareUrl = `${siteUrl}/pool/${slug}`;

    return NextResponse.json({ pool: data, shareUrl }, { status: 201 });
  } catch (error) {
    console.error("Corporate pools POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

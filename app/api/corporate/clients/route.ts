import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createClientSchema = z.object({
  corporateAccountId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  company: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  tier: z.enum(["platinum", "gold", "silver"]).default("silver"),
  birthday: z.string().optional(),
  workAnniversary: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const tier = searchParams.get("tier");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("client_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (accountId) {
      query = query.eq("corporate_account_id", accountId);
    }
    if (tier) {
      query = query.eq("tier", tier);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch clients error:", error);
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }

    return NextResponse.json({ clients: data });
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate next occasion
    let nextOccasion = null;
    let nextOccasionDate = null;
    if (data.birthday) {
      nextOccasion = "birthday";
      nextOccasionDate = data.birthday;
    } else if (data.workAnniversary) {
      nextOccasion = "work_anniversary";
      nextOccasionDate = data.workAnniversary;
    }

    const { data: client, error } = await supabaseAdmin
      .from("client_profiles")
      .insert({
        corporate_account_id: data.corporateAccountId || null,
        name: data.name,
        company: data.company || null,
        role: data.role || null,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        tier: data.tier,
        birthday: data.birthday || null,
        work_anniversary: data.workAnniversary || null,
        next_occasion: nextOccasion,
        next_occasion_date: nextOccasionDate,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create client error:", error);
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createAccountSchema = z.object({
  companyName: z.string().min(1).max(200),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = supabaseAdmin
      .from("corporate_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch corporate accounts error:", error);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    return NextResponse.json({ accounts: data });
  } catch (error) {
    console.error("Corporate accounts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyName, companyEmail, companyPhone, taxId, industry, employeeCount } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("corporate_accounts")
      .insert({
        company_name: companyName,
        company_email: companyEmail || null,
        company_phone: companyPhone || null,
        tax_id: taxId || null,
        industry: industry || null,
        employee_count: employeeCount || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create corporate account error:", error);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Create default brand profile
    await supabaseAdmin.from("brand_profiles").insert({
      corporate_account_id: data.id,
      brand_color: "#9B1B5A",
    });

    return NextResponse.json({ account: data }, { status: 201 });
  } catch (error) {
    console.error("Corporate accounts POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

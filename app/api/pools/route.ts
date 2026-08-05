import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const CreatePoolInput = z.object({
  title: z.string().min(3).max(255),
  targetAmount: z.number().positive(),
  expiresAt: z.string().datetime(),
});

export async function POST(req: Request) {
  const parsed = CreatePoolInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, targetAmount, expiresAt } = parsed.data;
  const baseSlug = slugify(title);
  let slug = baseSlug;

  // Ensure slug is unique by appending a short suffix if needed
  const { data: existing } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  const { data: pool, error } = await supabaseAdmin
    .from("group_gifting_pools")
    .insert({
      title,
      slug,
      target_amount: targetAmount,
      current_balance: 0,
      status: "active",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error || !pool) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create pool" },
      { status: 500 }
    );
  }

  return NextResponse.json({ pool });
}

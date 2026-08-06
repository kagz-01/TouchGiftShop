import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const ContributeInput = z.object({
  contributorName: z.string().min(1).max(100),
  contributorPhone: z.string().min(9),
  amount: z.number().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const parsed = ContributeInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { contributorName, contributorPhone, amount } = parsed.data;

  const { data: pool, error: poolError } = await supabaseAdmin
    .from("group_gifting_pools")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (poolError || !pool) {
    return NextResponse.json(
      { error: "Pool not found or no longer active" },
      { status: 404 }
    );
  }

  if (new Date(pool.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This pool has expired" },
      { status: 400 }
    );
  }

  const { data: contribution, error: insertError } = await supabaseAdmin
    .from("pool_contributions")
    .insert({
      pool_id: pool.id,
      contributor_name: contributorName,
      contributor_phone: contributorPhone,
      amount,
      is_verified: false,
    })
    .select()
    .single();

  if (insertError || !contribution) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to record contribution" },
      { status: 500 }
    );
  }

  // Return contribution ID — client handles PesaPal checkout redirect
  return NextResponse.json({ contribution, poolSlug: params.slug });
}

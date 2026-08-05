import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { initiateStkPush } from "@/lib/mpesa";

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

  // Find the pool
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

  // Check if pool has expired
  if (new Date(pool.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This pool has expired" },
      { status: 400 }
    );
  }

  // Insert contribution as pending
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

  // Trigger M-Pesa STK push to the contributor's phone
  try {
    const { checkoutRequestId } = await initiateStkPush({
      phoneNumber: contributorPhone,
      amount,
      accountReference: `pool-${pool.slug}`.slice(0, 12),
      transactionDesc: `Pool: ${pool.title}`.slice(0, 13),
    });

    return NextResponse.json({
      contribution,
      checkoutRequestId,
    });
  } catch (err) {
    // Contribution stays pending — contributor can retry
    return NextResponse.json(
      {
        contribution,
        error:
          err instanceof Error ? err.message : "STK push failed to start",
      },
      { status: 502 }
    );
  }
}

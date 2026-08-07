import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/reviews/[id]/vote — toggle helpful vote (one per IP)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const forwarded = req.headers.get("x-forwarded-for");
  const voterIp = forwarded?.split(",")[0]?.trim() || "unknown";

  // Check if already voted
  const { data: existing } = await supabaseAdmin
    .from("review_votes")
    .select("id")
    .eq("review_id", params.id)
    .eq("voter_ip", voterIp)
    .single();

  if (existing) {
    // Remove vote
    const { error: delError } = await supabaseAdmin
      .from("review_votes")
      .delete()
      .eq("id", existing.id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // Decrement helpful_count
    await supabaseAdmin.rpc("decrement_helpful_count", {
      review_id_param: params.id,
    });

    return NextResponse.json({ voted: false });
  }

  // Add vote
  const { error: insertError } = await supabaseAdmin
    .from("review_votes")
    .insert({ review_id: params.id, voter_ip: voterIp });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment helpful_count
  await supabaseAdmin.rpc("increment_helpful_count", {
    review_id_param: params.id,
  });

  return NextResponse.json({ voted: true });
}

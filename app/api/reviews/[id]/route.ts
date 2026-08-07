import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  sellerReply: z.string().max(1000).optional(),
  status: z.enum(["pending", "approved", "flagged", "rejected"]).optional(),
});

// GET /api/reviews/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*, media:review_media(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ review: data });
}

// PATCH /api/reviews/[id] — edit review (author) or moderate (admin)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = updateReviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.sellerReply !== undefined) {
    updates.seller_replied_at = new Date().toISOString();
  }

  // Remove undefined values
  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) delete updates[key];
  });

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}

// DELETE /api/reviews/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Fetch review to get media URLs for cleanup
  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("id, media:review_media(url)")
    .eq("id", params.id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Delete media files from storage
  const media = (review as { media?: { url: string }[] }).media || [];
  if (media.length > 0) {
    const paths = media
      .map((m) => {
        const url = m.url;
        const match = url.match(/reviews\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabaseAdmin.storage.from("reviews").remove(paths);
    }
  }

  // Delete review (cascades to review_media and review_votes)
  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}

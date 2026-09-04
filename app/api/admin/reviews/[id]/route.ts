import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "flagged", "rejected"]).optional(),
});

// PATCH /api/admin/reviews/[id] — moderate review
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = updateReviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("id, media:review_media(url)")
    .eq("id", params.id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

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

  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}

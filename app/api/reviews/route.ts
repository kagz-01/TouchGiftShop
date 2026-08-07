import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  reviewerName: z.string().min(1).max(100),
  isAnonymous: z.boolean().optional(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        mediaType: z.enum(["image", "video"]),
      })
    )
    .max(5)
    .optional(),
});

// POST /api/reviews — create a review
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = createReviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { productId, orderId, rating, title, body, reviewerName, isAnonymous, media } =
    parsed.data;

  let isVerified = false;
  if (orderId) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (order && order.status === "delivered") {
      isVerified = true;
    }
  }

  const { data: review, error: reviewError } = await supabaseAdmin
    .from("reviews")
    .insert({
      product_id: productId,
      order_id: orderId || null,
      rating,
      title: title || null,
      body: body || null,
      reviewer_name: isAnonymous ? "Anonymous" : reviewerName,
      is_anonymous: isAnonymous || false,
      is_verified_purchase: isVerified,
    })
    .select()
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  if (media && media.length > 0) {
    const mediaRows = media.map((m, i) => ({
      review_id: review.id,
      url: m.url,
      media_type: m.mediaType,
      sort_order: i,
    }));

    const { error: mediaError } = await supabaseAdmin
      .from("review_media")
      .insert(mediaRows);

    if (mediaError) {
      console.error("Failed to insert review media:", mediaError.message);
    }
  }

  return NextResponse.json({ review }, { status: 201 });
}

// GET /api/reviews?productId=xxx&sort=newest|highest|lowest|helpful&page=1&limit=10&rating=5
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const ratingFilter = searchParams.get("rating");
  const hasPhotos = searchParams.get("hasPhotos") === "true";
  const verifiedOnly = searchParams.get("verified") === "true";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("reviews")
    .select("*, media:review_media(*)", { count: "exact" })
    .eq("status", "approved");

  if (productId) {
    query = query.eq("product_id", productId);
  }

  if (ratingFilter) {
    query = query.eq("rating", parseInt(ratingFilter, 10));
  }

  if (verifiedOnly) {
    query = query.eq("is_verified_purchase", true);
  }

  switch (sort) {
    case "highest":
      query = query.order("rating", { ascending: false });
      break;
    case "lowest":
      query = query.order("rating", { ascending: true });
      break;
    case "helpful":
      query = query.order("helpful_count", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let reviews = data || [];
  if (hasPhotos) {
    reviews = reviews.filter((r) => r.media && r.media.length > 0);
  }

  return NextResponse.json({
    reviews,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

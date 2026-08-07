import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/reviews/stats?productId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = data || [];
  const total = reviews.length;

  if (total === 0) {
    return NextResponse.json({
      averageRating: 0,
      totalReviews: 0,
      distribution: [5, 4, 3, 2, 1].map((r) => ({
        rating: r,
        count: 0,
        percentage: 0,
      })),
    });
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Math.round((sum / total) * 10) / 10;

  const distribution = [5, 4, 3, 2, 1].map((r) => {
    const count = reviews.filter((rev) => rev.rating === r).length;
    return {
      rating: r,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });

  return NextResponse.json({ averageRating, totalReviews: total, distribution });
}

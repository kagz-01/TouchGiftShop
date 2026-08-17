// Mirrors db/schema.sql — keep in sync as the schema evolves.

export type OrderStatus =
  | "pending_payment"
  | "processing"
  | "wrapped"
  | "dispatched"
  | "delivered"
  | "failed";

export interface Order {
  id: string;
  userId: string | null;
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  isAnonymous: boolean;
  dontCallRecipient: boolean;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryLandmark: string | null;
  recipientPinRequested: boolean;
  preDispatchPhotoUrl: string | null;
  createdAt: string;
}

export interface GiftPool {
  id: string;
  creatorId: string | null;
  targetAmount: number;
  currentBalance: number;
  title: string;
  slug: string;
  status: "active" | "completed" | "expired";
  expiresAt: string;
}

export interface PoolContribution {
  id: string;
  contributorName: string;
  contributorPhone: string;
  amount: number;
  isVerified: boolean;
  createdAt: string;
}

// Note: matches Supabase's raw snake_case column names, since /api/products
// currently passes the query result straight through without remapping.
// TODO: decide whether to remap to camelCase in the API layer as the app
// grows — fine to leave as-is for now.
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category?: string;
  images?: string[];
  is_personalizable: boolean;
  in_stock: boolean;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  note: string | null;
  isFulfilled: boolean;
}

// ---------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------

export type ReviewStatus = "pending" | "approved" | "flagged" | "rejected";

export interface Review {
  id: string;
  userId: string | null;
  productId: string | null;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  reviewerName: string;
  reviewer_name?: string;
  isAnonymous: boolean;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMedia {
  id: string;
  reviewId: string;
  url: string;
  mediaType: "image" | "video";
  sortOrder: number;
  createdAt: string;
}

export interface ReviewVote {
  id: string;
  reviewId: string;
  voterIp: string;
  createdAt: string;
}

export interface ReviewWithMedia extends Review {
  media: ReviewMedia[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

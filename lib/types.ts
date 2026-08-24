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

export type PoolStatus = "active" | "completed" | "expired" | "fulfilled" | "cancelled" | "refunded";
export type PoolPrivacyMode = "named" | "anonymous";
export type PoolOverTargetBehaviour = "wallet_credit" | "gift_upgrade";

export interface GiftPool {
  id: string;
  creatorId: string | null;
  organiserUserId: string | null;
  // Recipient
  recipientName: string;
  recipientPhotoUrl: string | null;
  occasion: string | null;
  // Pool basics
  title: string;
  description: string | null;
  slug: string;
  // Gift
  giftProductId: string | null;
  giftName: string | null;
  giftPrice: number | null;
  giftImageUrl: string | null;
  // Financial
  targetAmount: number;
  currentBalance: number;
  minContribution: number;
  overTargetBehaviour: PoolOverTargetBehaviour;
  underTargetAction: "refund" | "extend" | "downgrade" | null;
  // Privacy
  privacyMode: PoolPrivacyMode;
  surpriseMode: boolean;
  ghostModeAllowed: boolean;
  // Media
  voiceMessageUrl: string | null;
  videoMessageUrl: string | null;
  // Status & timing
  status: PoolStatus;
  expiresAt: string;
  closedAt: string | null;
  orderPlacedAt: string | null;
  createdAt: string;
  // Computed (joined)
  contributions?: PoolContribution[];
}

export interface PoolContribution {
  id: string;
  poolId: string;
  contributorName: string | null;
  contributorPhone: string;
  amount: number;
  message: string | null;
  paymentMethod: string;
  paymentRef: string | null;
  pesapalTrackingId: string | null;
  isVerified: boolean;
  isAnonymous: boolean;
  isGhost: boolean;
  splitParentId: string | null;
  createdAt: string;
}

// Note: matches Supabase's raw snake_case column names, since /api/products
// currently passes the query result straight through without remapping.
// TODO: decide whether to remap to camelCase in the API layer as the app
// grows — fine to leave as-is for now.
export interface ColorVariant {
  name: string;
  image?: string;
  priceOverride?: number;
}

export interface SizeVariant {
  name: string;
  priceOverride?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  category?: string;
  images?: string[];
  is_personalizable: boolean;
  in_stock: boolean;
  stock_quantity: number | null;
  sku: string | null;
  status: string | null;
  weight_kg: number | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  color_variants: ColorVariant[] | null;
  size_variants: SizeVariant[] | null;
  is_coming_soon: boolean | null;
  product_specs?: { spec_key: string; spec_value: string; icon: string | null; sort_order?: number }[];
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

// ---------------------------------------------------------------------
// Product Specs — attributes like volume, ABV, age, origin
// ---------------------------------------------------------------------

export interface ProductSpec {
  id: string;
  product_id: string;
  spec_key: string;
  spec_value: string;
  icon: string | null;
  sort_order: number;
}

// ---------------------------------------------------------------------
// Hamper Bundles — pre-made gift hampers
// ---------------------------------------------------------------------

export interface HamperBundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  regular_price: number;
  bundle_price: number;
  category: string | null;
  occasions: string[];
  item_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_coming_soon: boolean | null;
  sort_order: number;
  created_at: string;
  items?: HamperBundleItem[];
}

// Corporate pre-made templates (B2B — price ranges, bulk recipients)
export interface HamperTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_range_min: number | null;
  price_range_max: number | null;
  item_count: number;
  occasions: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  items?: HamperTemplateItem[];
}

export interface HamperTemplateItem {
  id?: string;
  template_id?: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  sort_order?: number;
}

export interface HamperBundleItem {
  id: string;
  bundle_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  sort_order: number;
  product?: Product;
}

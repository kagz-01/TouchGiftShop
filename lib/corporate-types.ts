// Corporate Innovation Database Types
// Generated from corporate-innovation-migration.sql
// Run: npx supabase gen types typescript --local > lib/database.types.ts
// for full auto-generated types. These are the hand-typed versions for reference.

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

export type CorporateOrderStatus =
  | "draft"
  | "pending_payment"
  | "processing"
  | "wrapped"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PoolTier = "casual" | "standard" | "premium" | "luxury";

export type MilestoneTriggerType =
  | "birthday"
  | "work_anniversary"
  | "promotion"
  | "new_hire"
  | "farewell"
  | "holiday"
  | "custom";

export type WhitelabelPlan = "starter" | "professional" | "enterprise";

export type ClientTier = "platinum" | "gold" | "silver";

export type VendorStatus = "pending" | "active" | "suspended" | "inactive";

export type CalendarEventStatus =
  | "scheduled"
  | "pool_active"
  | "ordered"
  | "sent"
  | "delivered"
  | "cancelled";

// ═══════════════════════════════════════════════════════════
// PHASE 1: Corporate Hamper Builder + Brand Studio + Templates
// ═══════════════════════════════════════════════════════════

export interface CorporateAccount {
  id: string;
  user_id: string | null;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  tax_id: string | null;
  industry: string | null;
  employee_count: number | null;
  credit_limit: number;
  credit_used: number;
  default_payment_terms: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  corporate_account_id: string;
  logo_url: string | null;
  brand_color: string;
  secondary_color: string | null;
  custom_domain: string | null;
  tagline: string | null;
  created_at: string;
  updated_at: string;
}

export interface HamperTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_range_min: number | null;
  price_range_max: number | null;
  item_count: number;
  items: HamperTemplateItem[];
  occasions: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface HamperTemplateItem {
  id: string;
  template_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  category: string | null;
  quantity: number;
  sort_order: number;
  created_at: string;
}

export interface CorporateOrder {
  id: string;
  corporate_account_id: string | null;
  user_id: string | null;
  status: CorporateOrderStatus;
  company_name: string | null;
  sender_name: string;
  sender_phone: string;
  custom_message: string | null;
  gift_wrap: string;
  brand_profile_id: string | null;
  template_id: string | null;
  hamper_items: HamperItem[];
  recipient_count: number;
  subtotal: number;
  bulk_discount_percent: number;
  bulk_discount_amount: number;
  wrap_surcharge: number;
  total_amount: number;
  delivery_date: string | null;
  payment_tracking_id: string | null;
  payment_merchant_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HamperItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface CorporateOrderRecipient {
  id: string;
  corporate_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  personal_note: string | null;
  status: CorporateOrderStatus;
  order_id: string | null;
  created_at: string;
}

export interface BudgetRule {
  id: string;
  corporate_account_id: string;
  name: string;
  tier: PoolTier;
  min_budget: number;
  max_budget: number;
  preferred_categories: string[];
  excluded_product_ids: string[];
  is_active: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 2: Team Gift Pool (Corporate Kuchanga)
// ═══════════════════════════════════════════════════════════

export interface CorporateGiftPool {
  id: string;
  corporate_account_id: string | null;
  creator_user_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  status: string; // pool_status_enum

  // Recipient
  recipient_name: string;
  recipient_role: string | null;
  recipient_department: string | null;
  occasion: string;

  // Pool config
  target_amount: number;
  current_balance: number;
  min_contribution: number;
  deadline: string;

  // Company matching
  company_match_enabled: boolean;
  company_match_ratio: number;
  company_match_cap: number;
  company_match_used: number;

  // Privacy & experience
  show_leaderboard: boolean;
  auto_reminders: boolean;
  anonymous_contributions: boolean;

  // Tracking
  contributor_count: number;
  milestone_25_sent: boolean;
  milestone_50_sent: boolean;
  milestone_75_sent: boolean;
  milestone_100_sent: boolean;
  order_placed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorporatePoolContribution {
  id: string;
  pool_id: string;
  contributor_name: string;
  contributor_phone: string;
  amount: number;
  message: string | null;
  payment_method: string;
  payment_ref: string | null;
  is_verified: boolean;
  is_anonymous: boolean;
  company_matched_amount: number;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: Corporate Gifting Calendar
// ═══════════════════════════════════════════════════════════

export interface CorporateCalendarEvent {
  id: string;
  corporate_account_id: string | null;
  created_by: string | null;

  title: string;
  description: string | null;
  event_date: string;
  event_type: MilestoneTriggerType;

  // Recipient
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  department: string | null;
  role: string | null;

  // Gift config
  gift_budget: number | null;
  gift_product_id: string | null;
  gift_template_id: string | null;
  custom_message: string | null;

  // Automation
  auto_order: boolean;
  auto_pool: boolean;
  pool_id: string | null;
  reminder_days_before: number;

  // Status
  status: CalendarEventStatus;
  order_id: string | null;

  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 4: WhatsApp Bot
// ═══════════════════════════════════════════════════════════

export interface WhatsAppBotFlow {
  id: string;
  corporate_account_id: string | null;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  message_template: string;
  is_active: boolean;
  last_triggered_at: string | null;
  total_triggered: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  corporate_account_id: string | null;
  flow_id: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  message_text: string;
  status: string;
  external_message_id: string | null;
  metadata: Record<string, unknown>;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 5: White-Label Portal
// ═══════════════════════════════════════════════════════════

export interface WhitelabelAccount {
  id: string;
  user_id: string | null;
  agency_name: string;
  plan: WhitelabelPlan;
  commission_rate: number;

  // Branding
  brand_name: string | null;
  brand_color: string;
  logo_url: string | null;
  custom_domain: string | null;

  // Limits
  monthly_order_limit: number;
  monthly_orders_used: number;

  // Revenue
  total_revenue: number;
  total_commission_earned: number;
  pending_payout: number;

  // Status
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhitelabelStorefront {
  id: string;
  whitelabel_account_id: string;
  name: string;
  slug: string;
  description: string | null;
  custom_domain: string | null;
  theme_config: Record<string, unknown>;
  product_ids: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 6: Client Appreciation Network
// ═══════════════════════════════════════════════════════════

export interface ClientProfile {
  id: string;
  corporate_account_id: string | null;
  created_by: string | null;

  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  tier: ClientTier;

  // Relationship
  relationship_strength: number;
  total_gifts_sent: number;
  total_amount_spent: number;
  last_gift_date: string | null;

  // Occasions
  birthday: string | null;
  work_anniversary: string | null;
  next_occasion: string | null;
  next_occasion_date: string | null;

  // Notes
  notes: string | null;
  preferences: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export interface ClientGiftHistory {
  id: string;
  client_id: string;
  corporate_order_id: string | null;
  gift_name: string;
  gift_amount: number;
  occasion: string | null;
  occasion_date: string | null;
  status: string;
  recipient_feedback: string | null;
  rating: number | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface ClientOccasion {
  id: string;
  client_id: string;
  occasion_type: string;
  occasion_date: string;
  recurring: boolean;
  recurrence_pattern: string;
  gift_budget: number | null;
  auto_gift: boolean;
  template_id: string | null;
  last_triggered_date: string | null;
  is_active: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 7: Corporate Impact Dashboard
// ═══════════════════════════════════════════════════════════

export interface CorporateAnalytics {
  id: string;
  corporate_account_id: string | null;
  period_start: string;
  period_end: string;

  total_gifts_sent: number;
  total_spend: number;
  avg_gift_value: number;

  pools_created: number;
  pool_participation_rate: number;
  total_pool_contributions: number;

  clients_served: number;
  client_retention_rate: number;
  avg_relationship_strength: number;

  employee_satisfaction_score: number;
  milestone_gifts_sent: number;

  whatsapp_messages_sent: number;
  whatsapp_response_rate: number;

  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 8: Virtual Showroom
// ═══════════════════════════════════════════════════════════

export interface ShowroomConfiguration {
  id: string;
  corporate_account_id: string | null;
  name: string;
  description: string | null;
  product_ids: string[];
  layout: Record<string, unknown>;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShowroomView {
  id: string;
  configuration_id: string;
  viewer_ip: string | null;
  viewer_user_id: string | null;
  product_id: string | null;
  view_duration_seconds: number | null;
  viewed_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 9: Automated Milestone Gifting
// ═══════════════════════════════════════════════════════════

export interface MilestoneRule {
  id: string;
  corporate_account_id: string | null;
  name: string;
  description: string | null;
  trigger_type: MilestoneTriggerType;

  // Gift config
  gift_budget: number;
  gift_product_id: string | null;
  gift_template_id: string | null;
  custom_message_template: string | null;

  // Automation
  auto_order: boolean;
  auto_pool: boolean;
  notify_hr: boolean;
  send_whatsapp: boolean;

  // Timing
  trigger_days_before: number;
  trigger_time: string;

  // Escalation
  escalation_enabled: boolean;
  escalation_tiers: EscalationTier[];

  // Stats
  is_active: boolean;
  total_triggered: number;
  last_triggered_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface EscalationTier {
  years: number;
  budget: number;
  template_id?: string;
}

export interface MilestoneTriggerLog {
  id: string;
  rule_id: string;
  corporate_account_id: string | null;
  recipient_name: string;
  recipient_phone: string | null;
  trigger_type: MilestoneTriggerType;
  trigger_date: string;

  gift_product_id: string | null;
  gift_amount: number | null;
  pool_id: string | null;
  order_id: string | null;

  status: string;
  whatsapp_sent: boolean;
  hr_notified: boolean;

  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PHASE 10: B2B2C Marketplace
// ═══════════════════════════════════════════════════════════

export interface MarketplaceVendor {
  id: string;
  user_id: string | null;
  business_name: string;
  description: string | null;
  location: string | null;
  specialty: string | null;
  logo_url: string | null;
  banner_url: string | null;

  status: VendorStatus;
  is_verified: boolean;
  verified_at: string | null;
  business_registration_number: string | null;
  tax_certificate_url: string | null;

  avg_rating: number;
  total_reviews: number;
  total_products: number;

  delivery_time: string | null;
  min_order_amount: number;
  free_delivery_threshold: number | null;

  commission_rate: number;
  total_revenue: number;
  pending_payout: number;

  created_at: string;
  updated_at: string;
}

export interface MarketplaceProduct {
  id: string;
  vendor_id: string;
  product_id: string | null;

  name: string;
  description: string | null;
  price: number;
  bulk_price: number | null;
  bulk_min_quantity: number | null;
  category: string | null;
  images: string[];

  is_active: boolean;
  free_delivery: boolean;
  handling_time: string;

  total_sold: number;
  avg_rating: number;
  total_reviews: number;

  created_at: string;
  updated_at: string;
}

export interface VendorPayout {
  id: string;
  vendor_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  orders_included: number;
  status: string;
  payment_method: string;
  payment_ref: string | null;
  paid_at: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

// Phase 1: Corporate Orders
export interface CreateCorporateOrderRequest {
  companyName?: string;
  senderName: string;
  senderPhone: string;
  recipients: { name: string; phone: string; note?: string }[];
  hamperItems: HamperItem[];
  customMessage?: string;
  giftWrap: "standard" | "premium" | "branded";
  templateId?: string;
  deliveryDate?: string;
}

export interface CreateCorporateOrderResponse {
  success: boolean;
  orderId: string;
  recipientCount: number;
  pricing: {
    perItem: number;
    subtotal: number;
    bulkDiscount: string;
    totalAmount: number;
    currency: string;
  };
  payment: {
    trackingId: string;
    redirectUrl: string;
    merchantReference: string;
  };
}

// Phase 2: Corporate Pools
export interface CreateCorporatePoolRequest {
  title: string;
  description?: string;
  recipientName: string;
  recipientRole?: string;
  recipientDepartment?: string;
  occasion: string;
  targetAmount: number;
  minContribution: number;
  deadline: string;
  companyMatch?: {
    enabled: boolean;
    ratio: number;
    cap: number;
  };
  showLeaderboard?: boolean;
  autoReminders?: boolean;
}

export interface CreateCorporatePoolResponse {
  success: boolean;
  pool: CorporateGiftPool;
  shareUrl: string;
}

// Phase 4: WhatsApp Bot
export interface SendWhatsAppMessageRequest {
  flowId: string;
  recipientPhone: string;
  recipientName: string;
  variables: Record<string, string>;
}

// Phase 6: Client Profiles
export interface CreateClientProfileRequest {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  location?: string;
  tier?: ClientTier;
  birthday?: string;
  workAnniversary?: string;
  notes?: string;
}

// Phase 9: Milestone Rules
export interface CreateMilestoneRuleRequest {
  name: string;
  description?: string;
  triggerType: MilestoneTriggerType;
  giftBudget: number;
  giftProductId?: string;
  giftTemplateId?: string;
  customMessageTemplate?: string;
  autoOrder?: boolean;
  autoPool?: boolean;
  notifyHr?: boolean;
  sendWhatsapp?: boolean;
  triggerDaysBefore?: number;
  escalationEnabled?: boolean;
  escalationTiers?: EscalationTier[];
}

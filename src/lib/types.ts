export type UserRole = "super_admin" | "admin" | "moderator" | "finance" | "support" | "user";

export type AdStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "expired"
  | "archived"
  | "rejected"
  | "removed";

export interface Profile {
  id: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  verification_status: "none" | "verified";
  total_reviews: number;
  rating_sum: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  parent_id?: string;
}

export interface Ad {
  id: string;
  slug?: string | null;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  city?: string;
  price?: number;
  status: AdStatus;
  rejection_reason?: string;
  whatsapp?: string;
  messages_enabled: boolean;
  comments_enabled: boolean;
  is_featured: boolean;
  featured_until?: string;
  views_count: number;
  favorites_count: number;
  comments_count: number;
  messages_count: number;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  categories?: Category;
  ad_images?: AdImage[];
}

export interface AdImage {
  id: string;
  ad_id: string;
  cloudinary_public_id?: string;
  url: string;
  sort_order: number;
  status: "pending" | "processed" | "failed";
}

export interface Comment {
  id: string;
  ad_id: string;
  user_id: string;
  parent_id?: string;
  body: string;
  status: "visible" | "hidden" | "removed";
  created_at: string;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  ads?: Ad;
  buyer?: Profile;
  seller?: Profile;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface ContactEvent {
  id: string;
  ad_id: string;
  user_id: string;
  type: "message" | "whatsapp";
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
  ads?: Ad;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "ad" | "user" | "comment" | "message" | "review";
  target_id: string;
  reason: string;
  details?: string;
  status: "new" | "in_review" | "needs_info" | "closed" | "action_taken";
  resolved_by?: string;
  resolution_note?: string;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  ad_id?: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  reply?: string | null;
  replied_at?: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface CommissionDeclaration {
  id: string;
  ad_id: string;
  user_id: string;
  text_version: string;
  accepted_at: string;
}

export interface CommissionObligation {
  id: string;
  ad_id?: string;
  ad_reference_text?: string;
  user_id: string;
  deal_value?: number;
  deal_type?: "sale" | "rent" | "service" | "request";
  in_platform: boolean;
  rate: number;
  amount: number;
  status: "due" | "receipt_submitted" | "in_review" | "approved" | "rejected";
  notes?: string;
  created_at: string;
  updated_at: string;
  ads?: Ad;
  commission_payments?: CommissionPayment[];
}

export interface CommissionPayment {
  id: string;
  obligation_id: string;
  receipt_url?: string;
  transfer_name?: string;
  transfer_date?: string;
  status: "pending" | "approved" | "rejected" | "needs_info";
  rejection_reason?: string;
  reviewed_by?: string;
  created_at: string;
}

export interface FeatureEntitlement {
  id: string;
  user_id: string;
  feature_key: string;
  source: string;
  reason?: string;
  start_at: string;
  end_at?: string;
  status: "active" | "revoked" | "expired";
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminSettings {
  [key: string]: string;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  profiles?: Profile;
}

-- ============================================================
-- مناسبات — Schema كامل حسب المواصفات الهندسية v2
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- الهوية والحسابات
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  city text,
  phone text,
  whatsapp text,
  role text not null default 'user' check (role in ('super_admin','admin','moderator','finance','support','user')),
  is_active boolean not null default true,
  is_banned boolean not null default false,
  ban_reason text,
  verification_status text not null default 'none' check (verification_status in ('none','verified')),
  total_reviews int not null default 0,
  positive_reviews int not null default 0,
  negative_reviews int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ربط المستخدم بمزود الدخول (Google الآن، مزودون آخرون لاحقاً)
create table auth_identities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null default 'google',
  provider_user_id text,
  created_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

-- ============================================================
-- التصنيفات والإعلانات
-- ============================================================

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table ads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id),
  title text not null,
  description text not null,
  city text,
  price numeric,
  status text not null default 'draft' check (status in
    ('draft','pending_review','published','paused','expired','archived','rejected','removed')),
  rejection_reason text,
  whatsapp text,
  messages_enabled boolean not null default true,
  comments_enabled boolean not null default true,
  is_featured boolean not null default false,
  featured_until timestamptz,
  views_count int not null default 0,
  favorites_count int not null default 0,
  comments_count int not null default 0,
  messages_count int not null default 0,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ads_status on ads(status);
create index idx_ads_category on ads(category_id);
create index idx_ads_user on ads(user_id);
create index idx_ads_search on ads using gin (title gin_trgm_ops, description gin_trgm_ops);

create table ad_images (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  cloudinary_public_id text,
  url text not null,
  sort_order int not null default 0,
  status text not null default 'processed' check (status in ('pending','processed','failed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- التواصل: تعليقات، رسائل، واتساب attribution، مفضلة
-- ============================================================

create table comments (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  body text not null,
  status text not null default 'visible' check (status in ('visible','hidden','removed')),
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(ad_id, buyer_id, seller_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table contact_events (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('message','whatsapp')),
  created_at timestamptz not null default now()
);

create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  ad_id uuid not null references ads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, ad_id)
);

-- ============================================================
-- البلاغات والحظر والتقييمات
-- ============================================================

create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('ad','user','comment','message','review')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'new' check (status in ('new','in_review','needs_info','closed','action_taken')),
  resolved_by uuid references profiles(id),
  resolution_note text,
  created_at timestamptz not null default now()
);

create table blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_id)
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  ad_id uuid references ads(id) on delete set null,
  is_positive boolean not null,
  comment text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- العمولة: الإقرار، الالتزام، الدفع
-- ============================================================

create table commission_declarations (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  text_version text not null,
  accepted_at timestamptz not null default now()
);

create table commission_obligations (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references ads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  deal_value numeric,
  deal_type text check (deal_type in ('sale','rent','service','request')),
  in_platform boolean not null default true,
  rate numeric not null,
  amount numeric not null,
  status text not null default 'due' check (status in ('due','receipt_submitted','in_review','approved','rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commission_payments (
  id uuid primary key default uuid_generate_v4(),
  obligation_id uuid not null references commission_obligations(id) on delete cascade,
  receipt_url text,
  transfer_name text,
  transfer_date date,
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_info')),
  rejection_reason text,
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- المزايا (Entitlements)
-- ============================================================

create table feature_entitlements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  feature_key text not null,
  source text not null default 'commission_payment',
  reason text,
  start_at timestamptz not null default now(),
  end_at timestamptz,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- الإشعارات
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  channel text not null default 'in_app',
  enabled boolean not null default true,
  unique(user_id, channel)
);

-- ============================================================
-- إعدادات المنصة و Feature Flags
-- ============================================================

create table admin_settings (
  key text primary key,
  value text not null,
  label text,
  updated_at timestamptz not null default now()
);

create table feature_flags (
  key text primary key,
  enabled boolean not null default false,
  label text,
  updated_at timestamptz not null default now()
);

create table static_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- الإشراف وسجل التدقيق
-- ============================================================

create table moderation_actions (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  reason text,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Triggers
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.auth_identities (user_id, provider, provider_user_id)
  values (new.id, coalesce(new.raw_app_meta_data->>'provider', 'google'), new.id::text)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on profiles
  for each row execute procedure public.set_updated_at();
create trigger set_ads_updated_at before update on ads
  for each row execute procedure public.set_updated_at();
create trigger set_obligations_updated_at before update on commission_obligations
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table auth_identities enable row level security;
alter table categories enable row level security;
alter table ads enable row level security;
alter table ad_images enable row level security;
alter table comments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table contact_events enable row level security;
alter table favorites enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;
alter table reviews enable row level security;
alter table commission_declarations enable row level security;
alter table commission_obligations enable row level security;
alter table commission_payments enable row level security;
alter table feature_entitlements enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table admin_settings enable row level security;
alter table feature_flags enable row level security;
alter table static_pages enable row level security;
alter table moderation_actions enable row level security;
alter table audit_logs enable row level security;

-- قراءة عامة
create policy "public read profiles" on profiles for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read published ads" on ads for select using (status = 'published' or user_id = auth.uid());
create policy "public read ad_images" on ad_images for select using (true);
create policy "public read visible comments" on comments for select using (status = 'visible' or user_id = auth.uid());
create policy "public read approved reviews" on reviews for select using (status = 'approved' or reviewer_id = auth.uid() or reviewee_id = auth.uid());
create policy "public read admin_settings" on admin_settings for select using (true);
create policy "public read feature_flags" on feature_flags for select using (true);
create policy "public read static_pages" on static_pages for select using (true);

-- profiles
create policy "user update own profile" on profiles for update using (auth.uid() = id);

-- ads
create policy "user insert ad" on ads for insert with check (auth.uid() = user_id);
create policy "user update own ad" on ads for update using (auth.uid() = user_id);
create policy "user delete own ad" on ads for delete using (auth.uid() = user_id);

-- ad_images
create policy "user manage own ad_images insert" on ad_images for insert with check (
  exists (select 1 from ads where id = ad_id and user_id = auth.uid())
);
create policy "user manage own ad_images delete" on ad_images for delete using (
  exists (select 1 from ads where id = ad_id and user_id = auth.uid())
);

-- comments
create policy "auth insert comment" on comments for insert with check (auth.uid() = user_id);
create policy "user update own comment" on comments for update using (auth.uid() = user_id);
create policy "user delete own comment" on comments for delete using (auth.uid() = user_id);

-- conversations
create policy "auth read own conversations" on conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "auth insert conversation" on conversations for insert with check (auth.uid() = buyer_id);

-- messages
create policy "auth read own messages" on messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
create policy "auth insert message" on messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
create policy "auth update message read" on messages for update using (
  exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);

-- contact_events
create policy "auth insert contact_event" on contact_events for insert with check (auth.uid() = user_id);
create policy "auth read own contact_events" on contact_events for select using (
  auth.uid() = user_id or exists (select 1 from ads where id = ad_id and user_id = auth.uid())
);

-- favorites
create policy "auth manage own favorites" on favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reports
create policy "auth insert report" on reports for insert with check (auth.uid() = reporter_id);
create policy "auth read own reports" on reports for select using (auth.uid() = reporter_id);

-- blocks
create policy "auth manage own blocks" on blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- reviews
create policy "auth insert review" on reviews for insert with check (auth.uid() = reviewer_id);

-- commission_declarations
create policy "auth insert declaration" on commission_declarations for insert with check (auth.uid() = user_id);
create policy "auth read own declarations" on commission_declarations for select using (auth.uid() = user_id);

-- commission_obligations
create policy "auth read own obligations" on commission_obligations for select using (auth.uid() = user_id);

-- commission_payments
create policy "auth read own payments" on commission_payments for select using (
  exists (select 1 from commission_obligations o where o.id = obligation_id and o.user_id = auth.uid())
);
create policy "auth insert payment" on commission_payments for insert with check (
  exists (select 1 from commission_obligations o where o.id = obligation_id and o.user_id = auth.uid())
);

-- feature_entitlements
create policy "auth read own entitlements" on feature_entitlements for select using (auth.uid() = user_id);

-- notifications
create policy "auth read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "auth update own notifications" on notifications for update using (auth.uid() = user_id);

-- notification_preferences
create policy "auth manage own notif_prefs" on notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

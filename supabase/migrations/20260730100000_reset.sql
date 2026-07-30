-- ============================================================
-- مناسبات — إعادة تصفير كاملة قبل بناء الـ Schema الجديد
-- ============================================================
drop table if exists audit_logs cascade;
drop table if exists moderation_actions cascade;
drop table if exists feature_flags cascade;
drop table if exists admin_settings cascade;
drop table if exists platform_settings cascade;
drop table if exists notification_preferences cascade;
drop table if exists notifications cascade;
drop table if exists feature_entitlements cascade;
drop table if exists user_badges cascade;
drop table if exists badge_types cascade;
drop table if exists commission_payments cascade;
drop table if exists commission_obligations cascade;
drop table if exists commission_declarations cascade;
drop table if exists commissions cascade;
drop table if exists reviews cascade;
drop table if exists blocks cascade;
drop table if exists reports cascade;
drop table if exists favorites cascade;
drop table if exists contact_events cascade;
drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists comments cascade;
drop table if exists ad_images cascade;
drop table if exists ads cascade;
drop table if exists employee_permissions cascade;
drop table if exists blacklist cascade;
drop table if exists static_pages cascade;
drop table if exists auth_identities cascade;
drop table if exists profiles cascade;
drop table if exists categories cascade;
drop table if exists cities cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

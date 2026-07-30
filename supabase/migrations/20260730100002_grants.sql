-- منح صلاحيات Postgres على مستوى الجدول (RLS وحده لا يكفي)

grant usage on schema public to anon, authenticated;

grant select on
  profiles, categories, ads, ad_images, comments, reviews,
  admin_settings, feature_flags, static_pages
to anon, authenticated;

grant select, insert, update, delete on
  ads, ad_images, comments, conversations, messages, contact_events,
  favorites, reports, blocks, reviews, commission_declarations,
  commission_obligations, commission_payments, notifications,
  notification_preferences
to authenticated;

grant update on profiles to authenticated;
grant select on auth_identities, feature_entitlements, moderation_actions, audit_logs to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

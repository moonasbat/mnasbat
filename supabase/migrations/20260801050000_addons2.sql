insert into feature_flags (key, enabled, label) values
('trending_badge_enabled', true, 'شارة الأكثر مشاهدة'),
('referral_program_enabled', true, 'نظام الإحالة'),
('vacation_mode_enabled', true, 'وضع غير متاح للمعلن')
on conflict (key) do nothing;

insert into admin_settings (key, value, label) values
('trending_views_threshold', '50', 'حد المشاهدات لشارة الأكثر مشاهدة'),
('referral_reward_days', '7', 'مدة مكافأة الإحالة (أيام تمييز)')
on conflict (key) do nothing;

alter table profiles add column if not exists referred_by uuid references profiles(id);
alter table profiles add column if not exists referral_rewarded boolean not null default false;
alter table profiles add column if not exists vacation_mode boolean not null default false;
alter table ads add column if not exists auto_paused_by_vacation boolean not null default false;

-- استبدال مكافأة الإحالة الفردية (تمييز إعلان عند نشر أول إعلان للمدعوّ) بنظام
-- "أفضل ٣ داعين كل شهر" بجوائز نقدية تُدفع يدوياً من صاحب المنصة — أوسع قاعدة تحفيز
-- (يستحق أي مستخدم عند إكمال التسجيل، مو بس اللي ينشر إعلان) وأحمس (جائزة مرئية تنافسية)

-- دالة ترتيب أفضل الداعين خلال فترة زمنية معينة (تُستخدم لعرض ترتيب الشهر الحالي وللكرون الشهري)
create or replace function get_referral_leaderboard(start_at timestamptz, end_at timestamptz, limit_count int default 3)
returns table(
  referrer_id uuid,
  display_name text,
  username text,
  avatar_url text,
  whatsapp text,
  referral_count bigint
)
language sql
security definer
set search_path = public
as $$
  select p2.id, p2.display_name, p2.username, p2.avatar_url, p2.whatsapp, count(*)::bigint as referral_count
  from profiles p1
  join profiles p2 on p2.id = p1.referred_by
  where p1.referred_by is not null
    and p1.created_at >= start_at
    and p1.created_at < end_at
  group by p2.id, p2.display_name, p2.username, p2.avatar_url, p2.whatsapp
  order by referral_count desc
  limit limit_count;
$$;

grant execute on function get_referral_leaderboard(timestamptz, timestamptz, int) to anon, authenticated, service_role;

-- إعدادات جوائز الإحالة الشهرية (مبالغ افتراضية — تُعدَّل من لوحة التحكم)
delete from admin_settings where key = 'referral_reward_days';
insert into admin_settings (key, value, label) values
  ('referral_prize_1', '300', 'جائزة المركز الأول (ر.س)'),
  ('referral_prize_2', '150', 'جائزة المركز الثاني (ر.س)'),
  ('referral_prize_3', '50', 'جائزة المركز الثالث (ر.س)')
on conflict (key) do nothing;

-- قالب إشعار الفوز الشهري
delete from notification_templates where key in ('REFERRAL_REWARD_EARNED', 'REFERRAL_REWARD_PENDING');
insert into notification_templates (key, category, title, body, placeholders) values
  ('REFERRAL_MONTHLY_WINNER', 'الإحالة', '🏆 فزت بجائزة الإحالة الشهرية!', 'دعوت {count} شخص الشهر الماضي وحصلت على المركز {rank}! جائزتك {prize} ر.س، بيتواصل معك فريق مناسبات لتسليمها.', array['count','rank','prize'])
on conflict (key) do nothing;

-- قوالب نصوص الإشعارات — تُدار من لوحة التحكم بدل كونها نصوصاً مثبّتة داخل الكود
create table if not exists notification_templates (
  key text primary key,
  category text not null,
  title text not null,
  body text not null,
  placeholders text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table notification_templates enable row level security;
grant all on notification_templates to service_role;

insert into notification_templates (key, category, title, body, placeholders) values
  ('AD_APPROVED', 'الإعلانات', 'تم قبول إعلانك', 'تم قبول إعلانك "{ad_title}" ونشره على الموقع.', array['ad_title']),
  ('AD_REJECTED', 'الإعلانات', 'تم رفض إعلانك', 'تم رفض إعلانك "{ad_title}". السبب: {reason}', array['ad_title','reason']),
  ('AD_EXPIRING_SOON', 'الإعلانات', 'إعلانك على وشك الانتهاء', 'متبقي {days} أيام على انتهاء إعلانك "{ad_title}". جدده الآن ليستمر ظهوره للمهتمين.', array['ad_title','days']),
  ('AD_EXPIRED', 'الإعلانات', 'انتهت مدة إعلانك وتم حذفه', 'انتهت مدة عرض إعلانك "{ad_title}" ولم يُجدَّد في الوقت المناسب، فتم حذفه نهائياً. يمكنك نشره من جديد في أي وقت.', array['ad_title']),
  ('NEW_COMMENT', 'التعليقات والرسائل', 'تعليق جديد', 'لديك تعليق جديد على أحد إعلاناتك.', array[]::text[]),
  ('COMMENT_REPLY', 'التعليقات والرسائل', 'رد جديد على تعليقك', 'قام أحد المستخدمين بالرد على تعليقك.', array[]::text[]),
  ('NEW_MESSAGE_AD', 'التعليقات والرسائل', 'رسالة جديدة', 'لديك رسالة جديدة بخصوص أحد إعلاناتك.', array[]::text[]),
  ('NEW_MESSAGE_REPLY', 'التعليقات والرسائل', 'رسالة جديدة', 'لديك رسالة جديدة في إحدى محادثاتك.', array[]::text[]),
  ('REVIEW_REPLY', 'التقييمات', 'رد على تقييمك', 'قام المستخدم الذي قيّمته بالرد على تقييمك.', array[]::text[]),
  ('REVIEW_APPROVED', 'التقييمات', 'تقييم جديد على ملفك', 'تمت الموافقة على تقييم جديد وتم نشره على ملفك الشخصي.', array[]::text[]),
  ('REVIEW_REJECTED', 'التقييمات', 'تم رفض تقييم', 'تم رفض أحد التقييمات المقدمة على ملفك الشخصي.', array[]::text[]),
  ('COMMISSION_RECEIPT_APPROVED', 'العمولة', 'تم اعتماد إيصال العمولة', 'تم اعتماد إيصال العمولة. شكراً لالتزامك.', array[]::text[]),
  ('COMMISSION_RECEIPT_REJECTED', 'العمولة', 'تعذر اعتماد إيصال العمولة', 'تعذر اعتماد إيصال العمولة: {reason}.', array['reason']),
  ('ACCOUNT_BANNED', 'الحساب', 'تم إيقاف حسابك', 'تم إيقاف حسابك. السبب: {reason}.', array['reason']),
  ('ACCOUNT_UNBANNED', 'الحساب', 'تم إعادة تفعيل حسابك', 'تمت إعادة تفعيل حسابك ويمكنك استخدام المنصة بشكل طبيعي.', array[]::text[]),
  ('REPORT_RESOLVED', 'البلاغات', 'تم معالجة بلاغك', 'تم معالجة بلاغك: {resolution_note}', array['resolution_note']),
  ('REFERRAL_REWARD_EARNED', 'الإحالة', '🎉 مكافأة إحالة', 'أحد الأصدقاء الذين دعوتهم نشر أول إعلان له! حصلت على تمييز مجاني لأحد إعلاناتك لمدة {days} أيام.', array['days']),
  ('REFERRAL_REWARD_PENDING', 'الإحالة', '🎉 مكافأة إحالة', 'أحد الأصدقاء الذين دعوتهم نشر أول إعلان له! انشر إعلاناً واحصل على تمييز مجاني لمدة {days} أيام.', array['days'])
on conflict (key) do nothing;

-- عمود لتتبع آخر إشعار "يمكنك تجديد إعلانك الآن" أُرسل — يُصفّر عند كل تجديد فعلي حتى يُرسل مرة ثانية بالدورة القادمة
alter table ads add column if not exists renewal_reminder_sent_at timestamptz;

insert into admin_settings (key, value, label) values
('ad_renewal_cooldown_days', '5', 'عدد الأيام قبل السماح بتجديد الإعلان'),
('ad_deletion_grace_days', '30', 'مهلة الحذف النهائي بعد انتهاء الإعلان (يوماً)')
on conflict (key) do nothing;

insert into feature_flags (key, enabled, label) values
('commission_tab_enabled', true, 'إظهار تبويب العمولة وصفحة سياستها وإقرارها عند نشر إعلان')
on conflict (key) do nothing;

insert into notification_templates (key, category, title, body, placeholders) values
('AD_RENEWAL_AVAILABLE', 'الإعلانات', 'يمكنك تجديد إعلانك الآن', 'أصبح بإمكانك تجديد إعلانك "{ad_title}" الآن ليظهر بأحدث ترتيب للمهتمين.', array['ad_title'])
on conflict (key) do nothing;

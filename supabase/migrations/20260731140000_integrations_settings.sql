-- إعدادات ربط خدمات خارجية (تحليلات وتحقق ملكية) — تُدار ذاتياً من لوحة التحكم بدون تعديل كود
insert into admin_settings (key, value, label) values
('ga4_measurement_id', '', 'معرف قياس Google Analytics 4 (يبدأ بـ G-)'),
('google_site_verification', '', 'رمز تحقق ملكية Google Search Console'),
('facebook_pixel_id', '', 'معرف Facebook Pixel'),
('tiktok_pixel_id', '', 'معرف TikTok Pixel')
on conflict (key) do nothing;

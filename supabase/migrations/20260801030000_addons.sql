insert into feature_flags (key, enabled, label) values
('announcement_bar_enabled', false, 'شريط إعلان أعلى الموقع'),
('floating_whatsapp_enabled', false, 'زر واتساب عائم')
on conflict (key) do nothing;

insert into admin_settings (key, value, label) values
('announcement_text', '', 'نص شريط الإعلان'),
('announcement_link', '', 'رابط شريط الإعلان (اختياري)'),
('whatsapp_support_number', '', 'رقم واتساب الدعم (بصيغة +9665XXXXXXXX)')
on conflict (key) do nothing;

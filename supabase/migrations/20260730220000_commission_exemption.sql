insert into admin_settings (key, value, label) values
('commission_exempt_until', '', 'تاريخ انتهاء الإعفاء من العمولة (اتركه فارغاً لعدم وجود إعفاء)')
on conflict (key) do nothing;

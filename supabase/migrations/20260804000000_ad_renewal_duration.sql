insert into admin_settings (key, value, label)
values ('ad_renewal_duration_days', '60', 'مدة التجديد بالأيام')
on conflict (key) do nothing;

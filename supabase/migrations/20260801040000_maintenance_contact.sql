insert into feature_flags (key, enabled, label) values
('maintenance_mode_enabled', false, 'وضع الصيانة'),
('contact_form_enabled', true, 'نموذج تواصل معنا')
on conflict (key) do nothing;

insert into admin_settings (key, value, label) values
('maintenance_message', 'الموقع تحت الصيانة حالياً، سنعود قريباً.', 'رسالة وضع الصيانة')
on conflict (key) do nothing;

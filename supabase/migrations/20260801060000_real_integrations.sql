insert into admin_settings (key, value, label) values
('gtm_container_id', '', 'Google Tag Manager Container ID'),
('snapchat_pixel_id', '', 'معرف بكسل سناب شات'),
('clarity_project_id', '', 'معرف مشروع Microsoft Clarity'),
('recaptcha_site_key', '', 'مفتاح الموقع Google reCAPTCHA'),
('recaptcha_secret_key', '', 'المفتاح السري Google reCAPTCHA')
on conflict (key) do nothing;

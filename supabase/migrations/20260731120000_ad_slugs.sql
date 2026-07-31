-- روابط الإعلانات كـslug فقط (بدون المعرف UUID) — عمود slug فريد، يُملأ لاحقاً بسكربت للإعلانات الحالية
alter table ads add column slug text unique;
create index if not exists ads_slug_idx on ads (slug);

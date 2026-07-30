-- السماح بتسجيل عمولة لإعلان قديم/محذوف غير موجود في قائمة إعلانات المستخدم الحالية
alter table commission_obligations alter column ad_id drop not null;
alter table commission_obligations add column if not exists ad_reference_text text;

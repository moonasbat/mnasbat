-- إصلاح ضروري قبل السماح بحذف الإعلانات نهائياً: قيد commission_obligations.ad_id كان on delete cascade
-- يعني حذف إعلان عليه التزام عمولة (مستحق أو حتى معتمَد) كان يمسح السجل المالي بالكامل معه — نغيّره
-- إلى on delete set null (العمود أصلاً nullable ومعه ad_reference_text كبديل نصي منذ 20260730210000)
alter table commission_obligations drop constraint if exists commission_obligations_ad_id_fkey;
alter table commission_obligations
  add constraint commission_obligations_ad_id_fkey
  foreign key (ad_id) references ads(id) on delete set null;

-- خيار مراجعة يدوية/تلقائية للتقييمات، بنفس فكرة manual_review_enabled للإعلانات — افتراضياً يدوية (الوضع الحالي)
insert into feature_flags (key, enabled, label)
values ('reviews_manual_moderation_enabled', true, 'مراجعة التقييمات قبل نشرها')
on conflict (key) do nothing;

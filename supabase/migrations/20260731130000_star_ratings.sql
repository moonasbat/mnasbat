-- تحويل نظام التقييم من إيجابي/سلبي إلى تقييم بالنجوم (1-5) — الطريقة القياسية المعروفة

alter table reviews add column rating smallint;
update reviews set rating = case when is_positive then 5 else 1 end;
alter table reviews alter column rating set not null;
alter table reviews add constraint reviews_rating_range check (rating between 1 and 5);
alter table reviews drop column is_positive;

alter table profiles add column rating_sum int not null default 0;
update profiles set rating_sum = positive_reviews * 5 + negative_reviews * 1;
alter table profiles drop column positive_reviews;
alter table profiles drop column negative_reviews;

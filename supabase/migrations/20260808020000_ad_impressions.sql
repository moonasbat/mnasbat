-- مرات الظهور (Impressions): كل مرة يظهر الإعلان كبطاقة بقائمة (الرئيسية، نتائج البحث) —
-- إحصائية مختلفة عن "المشاهدات" (فتح صفحة الإعلان نفسها)، تعكس مدى انتشار الإعلان الفعلي
alter table ads add column if not exists impressions_count integer not null default 0;

-- زيادة جماعية بطلب واحد بدل استعلام لكل إعلان — تُستدعى من صفحات القوائم (الرئيسية، البحث)
create or replace function public.increment_ad_impressions(ad_ids uuid[])
returns void language plpgsql security definer as $$
begin
  update ads set impressions_count = impressions_count + 1 where id = any(ad_ids);
end;
$$;

grant execute on function public.increment_ad_impressions(uuid[]) to anon, authenticated;

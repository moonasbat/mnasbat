-- عدّاد جديد لعدد مرات مشاركة/نسخ رابط الإعلان — يظهر بإحصائيات الإعلان لصاحبه
alter table ads add column if not exists shares_count integer not null default 0;

create or replace function public.increment_ad_shares(ad_id_param uuid)
returns void language plpgsql security definer as $$
begin
  update ads set shares_count = shares_count + 1 where id = ad_id_param;
end;
$$;

grant execute on function public.increment_ad_shares(uuid) to anon, authenticated;

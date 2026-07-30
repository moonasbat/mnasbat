-- اسم مستخدم فريد بشروط تويتر — القسم المطلوب من المالك
alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

-- السماح لأي مستخدم مسجّل بالتحقق من توفر اسم مستخدم (قراءة عمود واحد فقط عبر الدالة أدناه)
create or replace function public.is_username_available(check_username text)
returns boolean language sql stable security definer as $$
  select not exists (
    select 1 from profiles where lower(username) = lower(check_username)
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

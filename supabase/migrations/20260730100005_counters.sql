-- تحديث عدادات الإعلان تلقائياً (favorites_count, comments_count, messages_count, views_count)

create or replace function public.bump_favorites_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update ads set favorites_count = favorites_count + 1 where id = new.ad_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update ads set favorites_count = greatest(favorites_count - 1, 0) where id = old.ad_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_favorites_count
  after insert or delete on favorites
  for each row execute procedure public.bump_favorites_count();

create or replace function public.bump_comments_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update ads set comments_count = comments_count + 1 where id = new.ad_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update ads set comments_count = greatest(comments_count - 1, 0) where id = old.ad_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_comments_count
  after insert or delete on comments
  for each row execute procedure public.bump_comments_count();

create or replace function public.bump_messages_count()
returns trigger language plpgsql security definer as $$
begin
  update ads set messages_count = messages_count + 1
  where id = (select ad_id from conversations where id = new.conversation_id);
  return new;
end;
$$;

create trigger trg_messages_count
  after insert on messages
  for each row execute procedure public.bump_messages_count();

-- زيادة المشاهدات — دالة تُستدعى من الخادم عند فتح صفحة الإعلان
create or replace function public.increment_ad_views(ad_id_param uuid)
returns void language plpgsql security definer as $$
begin
  update ads set views_count = views_count + 1 where id = ad_id_param;
end;
$$;

grant execute on function public.increment_ad_views(uuid) to anon, authenticated;

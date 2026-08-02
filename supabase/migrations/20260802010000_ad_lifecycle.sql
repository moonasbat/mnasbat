-- تتبّع وقت آخر تعديل على الإعلان (لعرض ملاحظة "معدّل بتاريخ..." للزوار)
alter table ads add column if not exists edited_at timestamptz;

-- دورة حياة الإعلان المُعدّلة: 30 يوم نشر -> إخفاء (expired) + تنبيه -> مهلة 30 يوم إضافية -> حذف نهائي
update notification_templates set
  title = 'انتهت مدة إعلانك',
  body = 'انتهت مدة عرض إعلانك "{ad_title}" وتوقف عن الظهور للزوار. عندك 30 يوماً إضافياً لتجديده وإلا سيُحذف نهائياً.'
where key = 'AD_EXPIRED';

insert into notification_templates (key, category, title, body, placeholders) values
  ('AD_PERMANENTLY_DELETED', 'الإعلانات', 'تم حذف إعلانك نهائياً', 'انتهت المهلة الإضافية ولم يُجدَّد إعلانك "{ad_title}"، فتم حذفه نهائياً من الموقع. يمكنك نشره من جديد في أي وقت.', array['ad_title'])
on conflict (key) do nothing;

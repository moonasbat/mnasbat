-- moderation_actions: جدول فارغ تماماً، تكرار لجدول audit_logs المستخدم فعلياً في كل لوحة التحكم
drop table if exists moderation_actions;

-- notification_preferences: جدول فارغ تماماً، بُني له RLS لكن لا توجد أي واجهة أو API يستخدمه
drop table if exists notification_preferences;

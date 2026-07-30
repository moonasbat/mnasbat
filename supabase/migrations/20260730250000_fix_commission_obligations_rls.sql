-- إصلاح حرج: سياسة RLS لإنشاء التزام عمولة كانت مفقودة بالكامل من البداية
-- كل عمليات إرسال العمولة كانت تفشل بخطأ "new row violates row-level security policy"
create policy "auth insert obligation" on commission_obligations for insert with check (auth.uid() = user_id);

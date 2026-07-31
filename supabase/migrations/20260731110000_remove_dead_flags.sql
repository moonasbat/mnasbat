-- إزالة أعلام ميزات لا تقابلها أي ميزة فعلية في المنتج (لا صفحة/منطق يستخدمها):
-- تسجيل الدخول بالجوال والبريد غير مبنيين إطلاقاً (Google هو الوحيد المتاح)،
-- وحفظ عمليات البحث ميزة لم تُبنَ بعد.
delete from feature_flags where key in ('phone_login_enabled', 'email_login_enabled', 'saved_search_enabled');

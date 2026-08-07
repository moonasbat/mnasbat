import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// عميل بدون قراءة كوكيز — للصفحات العامة (لا تحتاج تسجيل دخول) عشان تقدر تُخزَّن مؤقتاً (ISR/Cache)
// بدل ما تصير Dynamic بكل طلب لمجرد إنشاء عميل مرتبط بالجلسة
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

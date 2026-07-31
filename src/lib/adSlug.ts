// روابط الإعلانات slug فقط بدون أي معرف UUID ظاهر — يُخزَّن العمود slug في جدول ads
// عند إنشاء الإعلان لأول مرة ولا يتغيّر بعدها حتى لو عُدِّل العنوان لاحقاً (يحافظ على ثبات الروابط المشارَكة)

import { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "");
}

export function adUrl(ad: { slug?: string | null; id: string }): string {
  return `/ads/${ad.slug || ad.id}`;
}

// يولّد slug فريداً غير مستخدم في جدول ads — يضيف رقماً تسلسلياً عند التعارض (عنوان-2, عنوان-3 ...)
export async function generateUniqueAdSlug(supabase: SupabaseClient, title: string): Promise<string> {
  const base = slugify(title) || "اعلان";
  let candidate = base;
  let attempt = 1;
  while (attempt < 50) {
    const { data } = await supabase.from("ads").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

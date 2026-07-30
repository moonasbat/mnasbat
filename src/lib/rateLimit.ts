import { SupabaseClient } from "@supabase/supabase-js";

type RateLimitCheck = {
  supabase: SupabaseClient;
  settingKey: string;
  table: string;
  userIdColumn: string;
  userId: string;
  windowMs: number;
};

// يتحقق من عدد الصفوف التي أنشأها المستخدم خلال فترة زمنية مقابل حد مضبوط في admin_settings
export async function checkRateLimit({ supabase, settingKey, table, userIdColumn, userId, windowMs }: RateLimitCheck): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: setting } = await supabase.from("admin_settings").select("value").eq("key", settingKey).maybeSingle();
  const limit = Number(setting?.value);
  if (!limit || limit <= 0) return { ok: true };

  const since = new Date(Date.now() - windowMs).toISOString();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(userIdColumn, userId)
    .gte("created_at", since);

  if ((count ?? 0) >= limit) {
    return { ok: false, error: "تجاوزت الحد المسموح به لهذا الإجراء. يرجى المحاولة لاحقاً." };
  }
  return { ok: true };
}

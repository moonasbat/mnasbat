import { SupabaseClient } from "@supabase/supabase-js";

export async function getSiteFlags(supabase: SupabaseClient): Promise<Record<string, boolean>> {
  const { data } = await supabase.from("feature_flags").select("key,enabled");
  const flags: Record<string, boolean> = {};
  (data ?? []).forEach((r: { key: string; enabled: boolean }) => {
    flags[r.key] = r.enabled;
  });
  return flags;
}

export async function getSiteSettings(supabase: SupabaseClient): Promise<Record<string, string>> {
  const { data } = await supabase.from("admin_settings").select("key,value");
  const settings: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string }) => {
    settings[r.key] = r.value;
  });
  return settings;
}

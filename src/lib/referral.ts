import { SupabaseClient } from "@supabase/supabase-js";

export type ReferralLeaderboardRow = {
  referrer_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  referral_count: number;
};

function monthRange(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function previousMonthRange(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

// أفضل الداعين خلال الشهر الحالي (يُستخدم للعرض الحي بواجهة المستخدم)
export async function getCurrentMonthReferralLeaderboard(supabase: SupabaseClient, limit = 3) {
  const { start, end } = monthRange();
  const { data, error } = await supabase.rpc("get_referral_leaderboard", {
    start_at: start,
    end_at: end,
    limit_count: limit,
  });
  if (error) return [];
  return (data ?? []) as ReferralLeaderboardRow[];
}

// أفضل الداعين خلال الشهر الماضي (يُستخدم في وظيفة الكرون الشهرية لإعلان الفائزين)
export async function getPreviousMonthReferralLeaderboard(supabase: SupabaseClient, limit = 3) {
  const { start, end } = previousMonthRange();
  const { data, error } = await supabase.rpc("get_referral_leaderboard", {
    start_at: start,
    end_at: end,
    limit_count: limit,
  });
  if (error) return [];
  return (data ?? []) as ReferralLeaderboardRow[];
}

// عدد إحالات المستخدم خلال الشهر الحالي (لعرض "ترتيبك حتى الآن")
export async function getUserCurrentMonthReferralCount(supabase: SupabaseClient, userId: string) {
  const { start } = monthRange();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", userId)
    .gte("created_at", start);
  return count ?? 0;
}

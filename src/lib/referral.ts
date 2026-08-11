import { SupabaseClient } from "@supabase/supabase-js";

export type ReferralLeaderboardRow = {
  referrer_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  referral_count: number;
};

// نطاق شهر ميلادي كامل، بإزاحة monthsAgo عن الشهر الحالي (0 = الشهر الحالي، 1 = الشهر الماضي...)
function monthRangeAgo(monthsAgo: number, date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsAgo, 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsAgo + 1, 1));
  return { start: start.toISOString(), end: end.toISOString(), label: start };
}

function monthRange(date = new Date()) {
  return monthRangeAgo(0, date);
}

function previousMonthRange(date = new Date()) {
  return monthRangeAgo(1, date);
}

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

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

export type MonthlyLeaderboard = { monthLabel: string; rows: ReferralLeaderboardRow[] };

// أفضل الداعين لكل شهر من آخر N أشهر مكتملة (بدون الشهر الحالي) — للصفحة العامة "الفائزون السابقون"
export async function getPastMonthsReferralLeaderboards(supabase: SupabaseClient, monthsCount = 3, limit = 3) {
  const results: MonthlyLeaderboard[] = [];
  for (let i = 1; i <= monthsCount; i++) {
    const { start, end, label } = monthRangeAgo(i);
    const { data, error } = await supabase.rpc("get_referral_leaderboard", { start_at: start, end_at: end, limit_count: limit });
    const rows = error ? [] : ((data ?? []) as ReferralLeaderboardRow[]);
    if (rows.length > 0) {
      results.push({ monthLabel: `${ARABIC_MONTHS[label.getUTCMonth()]} ${label.getUTCFullYear()}`, rows });
    }
  }
  return results;
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

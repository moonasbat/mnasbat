import { SupabaseClient } from "@supabase/supabase-js";

export type ReferralLeaderboardRow = {
  referrer_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  referral_count: number;
};

// دورة برنامج الإحالة: ٥٥ يوم سباق فعلي، ثم ٥ أيام استراحة (لتسليم الجوائز)، ثم يبدأ سباق جديد من الصفر
export const RACE_DAYS = 55;
export const BREAK_DAYS = 5;
export const CYCLE_DAYS = RACE_DAYS + BREAK_DAYS;

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatArabicDate(d: Date) {
  return `${d.getUTCDate()} ${ARABIC_MONTHS[d.getUTCMonth()]}`;
}

// نقطة انطلاق الدورة الأولى — تُقرأ من الإعدادات (referral_cycle_anchor بصيغة YYYY-MM-DD)،
// ولو غير موجودة نستخدم بداية اليوم الحالي (يعني السباق يبدأ من اليوم)
async function getCycleAnchor(supabase: SupabaseClient): Promise<Date> {
  const { data } = await supabase.from("admin_settings").select("value").eq("key", "referral_cycle_anchor").maybeSingle();
  if (data?.value) {
    const d = new Date(`${data.value}T00:00:00.000Z`);
    if (!isNaN(d.getTime())) return d;
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export type CycleInfo = {
  cycleNumber: number;
  phase: "race" | "break";
  raceStart: Date;
  raceEnd: Date; // نهاية السباق (بداية الاستراحة) — نهاية غير شاملة
  cycleEnd: Date; // بداية الدورة التالية — نهاية غير شاملة
};

async function getCycleInfo(supabase: SupabaseClient, at: Date = new Date()): Promise<CycleInfo> {
  const anchor = await getCycleAnchor(supabase);
  const daysSince = Math.floor((at.getTime() - anchor.getTime()) / 86400000);
  const cycleNumber = Math.max(0, Math.floor(daysSince / CYCLE_DAYS));
  const raceStart = new Date(anchor.getTime() + cycleNumber * CYCLE_DAYS * 86400000);
  const raceEnd = new Date(raceStart.getTime() + RACE_DAYS * 86400000);
  const cycleEnd = new Date(raceStart.getTime() + CYCLE_DAYS * 86400000);
  const phase: "race" | "break" = at.getTime() < raceEnd.getTime() ? "race" : "break";
  return { cycleNumber, phase, raceStart, raceEnd, cycleEnd };
}

// معلومات الدورة الحالية للعرض بالواجهة (العدّاد الحي وغيره) — targetDate هو لحظة نهاية السباق
// إن كنا بمرحلة السباق، أو لحظة بداية السباق الجديد إن كنا بالاستراحة
export async function getReferralCycleDisplayInfo(supabase: SupabaseClient) {
  const info = await getCycleInfo(supabase);
  return {
    phase: info.phase,
    targetDate: (info.phase === "race" ? info.raceEnd : info.cycleEnd).toISOString(),
    raceStart: info.raceStart.toISOString(),
    raceEnd: info.raceEnd.toISOString(),
  };
}

// أفضل الداعين بالدورة الحالية — أثناء السباق يكون حي (حتى الآن)، وأثناء الاستراحة يعرض
// النتيجة النهائية المجمّدة لآخر سباق انتهى (نفس الفترة، بدون تصفير حتى يبدأ سباق جديد فعلياً)
export async function getCurrentCycleReferralLeaderboard(supabase: SupabaseClient, limit = 3) {
  const info = await getCycleInfo(supabase);
  const end = info.phase === "race" ? new Date() : info.raceEnd;
  const { data, error } = await supabase.rpc("get_referral_leaderboard", {
    start_at: info.raceStart.toISOString(),
    end_at: end.toISOString(),
    limit_count: limit,
  });
  if (error) return [];
  return (data ?? []) as ReferralLeaderboardRow[];
}

// أفضل الداعين بالدورة السابقة (يُستخدم في كرون إشعار الفائزين)
export async function getPreviousCycleReferralLeaderboard(supabase: SupabaseClient, limit = 3) {
  const info = await getCycleInfo(supabase);
  const prevCycleNumber = info.cycleNumber - 1;
  if (prevCycleNumber < 0) return [];
  const anchor = await getCycleAnchor(supabase);
  const raceStart = new Date(anchor.getTime() + prevCycleNumber * CYCLE_DAYS * 86400000);
  const raceEnd = new Date(raceStart.getTime() + RACE_DAYS * 86400000);
  const { data, error } = await supabase.rpc("get_referral_leaderboard", {
    start_at: raceStart.toISOString(),
    end_at: raceEnd.toISOString(),
    limit_count: limit,
  });
  if (error) return [];
  return (data ?? []) as ReferralLeaderboardRow[];
}

export type CycleLeaderboard = { cycleNumber: number; periodLabel: string; rows: ReferralLeaderboardRow[] };

// أفضل الداعين لكل دورة من آخر N دورات مكتملة (بدون الدورة الحالية) — للصفحة العامة "الفائزون السابقون"
export async function getPastCyclesReferralLeaderboards(supabase: SupabaseClient, cyclesCount = 3, limit = 3) {
  const info = await getCycleInfo(supabase);
  const anchor = await getCycleAnchor(supabase);
  const results: CycleLeaderboard[] = [];
  for (let n = info.cycleNumber - 1; n >= 0 && results.length < cyclesCount; n--) {
    const raceStart = new Date(anchor.getTime() + n * CYCLE_DAYS * 86400000);
    const raceEnd = new Date(raceStart.getTime() + RACE_DAYS * 86400000);
    const { data, error } = await supabase.rpc("get_referral_leaderboard", {
      start_at: raceStart.toISOString(),
      end_at: raceEnd.toISOString(),
      limit_count: limit,
    });
    const rows = error ? [] : ((data ?? []) as ReferralLeaderboardRow[]);
    if (rows.length > 0) {
      results.push({ cycleNumber: n, periodLabel: `${formatArabicDate(raceStart)} – ${formatArabicDate(raceEnd)}`, rows });
    }
  }
  return results;
}

// عدد إحالات المستخدم بالدورة الحالية (لعرض "ترتيبك حتى الآن")
export async function getUserCurrentCycleReferralCount(supabase: SupabaseClient, userId: string) {
  const info = await getCycleInfo(supabase);
  const end = info.phase === "race" ? new Date() : info.raceEnd;
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", userId)
    .gte("created_at", info.raceStart.toISOString())
    .lt("created_at", end.toISOString());
  return count ?? 0;
}

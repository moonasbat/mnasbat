import { createAdminClient } from "@/lib/supabase/admin";
import { renderNotification } from "@/lib/notificationTemplates";
import { getPreviousMonthReferralLeaderboard } from "@/lib/referral";
import { NextRequest, NextResponse } from "next/server";

// يُستدعى أول يوم من كل شهر عبر Vercel Cron (راجع vercel.json) — يحدّد أفضل ٣ داعين بالشهر
// الماضي ويرسل لكل واحد إشعار بفوزه، لكن الدفع الفعلي للجائزة يدوي من صاحب المنصة (يراجعهم بصفحة
// /admin/referrals ويتواصل معهم عبر واتساب المعروض هناك)
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: flag } = await admin.from("feature_flags").select("enabled").eq("key", "referral_program_enabled").maybeSingle();
  if (flag?.enabled === false) {
    return NextResponse.json({ ok: true, skipped: "referral_program_disabled" });
  }

  const { data: prizeRows } = await admin
    .from("admin_settings")
    .select("key,value")
    .in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]);
  const prizes: number[] = [300, 150, 50];
  for (const row of prizeRows ?? []) {
    const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
    if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
  }

  const winners = await getPreviousMonthReferralLeaderboard(admin, 3);
  if (winners.length === 0) {
    return NextResponse.json({ ok: true, winners: 0 });
  }

  const rows = await Promise.all(
    winners.map(async (w, i) => {
      const { title, body } = await renderNotification("REFERRAL_MONTHLY_WINNER", {
        count: w.referral_count,
        rank: i + 1,
        prize: prizes[i],
      });
      return { user_id: w.referrer_id, type: "REFERRAL_MONTHLY_WINNER", title, body };
    })
  );
  await admin.from("notifications").insert(rows);

  return NextResponse.json({ ok: true, winners: winners.length });
}

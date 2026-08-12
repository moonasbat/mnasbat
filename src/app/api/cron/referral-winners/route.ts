import { createAdminClient } from "@/lib/supabase/admin";
import { renderNotification } from "@/lib/notificationTemplates";
import { getPreviousCycleReferralLeaderboard, getReferralCycleDisplayInfo } from "@/lib/referral";
import { NextRequest, NextResponse } from "next/server";

// يُستدعى يومياً عبر Vercel Cron (راجع vercel.json). كل سباق إحالة يستمر ٥٥ يوم ثم استراحة ٥ أيام —
// أول ما تبدأ الاستراحة نحدد أفضل ٣ داعين بالسباق اللي بس انتهى ونرسل لهم إشعار فوز.
// نخزّن لحظة نهاية آخر سباق تم إشعار فائزيه (referral_last_notified_cycle) كعلامة مقارنة —
// لو نفس اللحظة تكررت (يعني ما زلنا بنفس فترة الاستراحة) نتجاهل، فما يتكرر الإشعار حتى لو الكرون
// اشتغل أكثر من مرة أو تأخر يوم أو يومين
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

  const cycleInfo = await getReferralCycleDisplayInfo(admin);
  if (cycleInfo.phase !== "break") {
    return NextResponse.json({ ok: true, skipped: "still_racing" });
  }

  const { data: markerRow } = await admin.from("admin_settings").select("value").eq("key", "referral_last_notified_cycle").maybeSingle();
  if (markerRow?.value === cycleInfo.raceEnd) {
    return NextResponse.json({ ok: true, skipped: "already_notified" });
  }

  const winners = await getPreviousCycleReferralLeaderboard(admin, 3);

  const { data: prizeRows } = await admin
    .from("admin_settings")
    .select("key,value")
    .in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]);
  const prizes: number[] = [300, 150, 50];
  for (const row of prizeRows ?? []) {
    const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
    if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
  }

  if (winners.length > 0) {
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
  }

  await admin
    .from("admin_settings")
    .upsert({ key: "referral_last_notified_cycle", value: cycleInfo.raceEnd, label: "آخر لحظة انتهاء سباق تم إشعار فائزيه" });

  return NextResponse.json({ ok: true, winners: winners.length });
}

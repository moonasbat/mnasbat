import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentCycleReferralLeaderboard, getPreviousCycleReferralLeaderboard, getReferralCycleDisplayInfo } from "@/lib/referral";
import { formatNumber } from "@/lib/formatTime";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { Trophy, Phone } from "lucide-react";
import Link from "next/link";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function AdminReferralsPage() {
  const admin = createAdminClient();

  const [{ data: prizeRows }, currentCycle, previousCycle, cycleInfo] = await Promise.all([
    admin.from("admin_settings").select("key,value").in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]),
    getCurrentCycleReferralLeaderboard(admin, 10),
    getPreviousCycleReferralLeaderboard(admin, 3),
    getReferralCycleDisplayInfo(admin),
  ]);

  const prizes: number[] = [300, 150, 50];
  for (const row of prizeRows ?? []) {
    const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
    if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإحالات"
        subtitle={`كل سباق ٥٥ يوم ثم استراحة ٥ أيام — أفضل ٣ داعين بكل سباق يفوزون بجائزة نقدية تُدفع يدوياً. الحالة الآن: ${cycleInfo.phase === "race" ? "سباق نشط" : "استراحة"}`}
      />

      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Trophy size={16} className="text-[#6D28D9]" /> فائزو السباق السابق — بانتظار الدفع</h2>
        </div>
        {previousCycle.length === 0 ? (
          <EmptyState icon={Trophy} title="ما فيه أي إحالات ناجحة بالسباق السابق" />
        ) : (
          <div className="divide-y divide-gray-100">
            {previousCycle.map((row, i) => (
              <div key={row.referrer_id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{MEDALS[i]}</span>
                  <div>
                    <Link href={`/admin/users/${row.referrer_id}`} className="text-sm font-bold text-gray-900 hover:text-[#6D28D9]">{row.display_name}</Link>
                    <p className="text-xs text-gray-400">{formatNumber(row.referral_count)} إحالة ناجحة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {row.whatsapp && (
                    <a href={`https://wa.me/${row.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600">
                      <Phone size={12} /> واتساب
                    </a>
                  )}
                  <span className="text-sm font-bold text-[#6D28D9]">{formatNumber(prizes[i])} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-bold text-gray-900 mb-4">ترتيب السباق الحالي (حي)</h2>
        {currentCycle.length === 0 ? (
          <EmptyState icon={Trophy} title="ما فيه أي إحالات ناجحة بالسباق الحالي بعد" />
        ) : (
          <div className="divide-y divide-gray-100">
            {currentCycle.map((row, i) => (
              <div key={row.referrer_id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-5">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                  <Link href={`/admin/users/${row.referrer_id}`} className="text-sm font-medium text-gray-900 hover:text-[#6D28D9]">{row.display_name}</Link>
                  {row.username && <span className="text-xs text-gray-400" dir="ltr">@{row.username}</span>}
                </div>
                <span className="text-sm font-bold text-gray-700">{formatNumber(row.referral_count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { createPublicClient } from "@/lib/supabase/public";
import { getPastMonthsReferralLeaderboards } from "@/lib/referral";
import { formatNumber } from "@/lib/formatTime";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import ReferralCountdown from "@/components/dashboard/ReferralCountdown";
import { Link2, MessageCircle, UserPlus, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "برنامج الإحالة",
  description: "ادعُ أصدقاءك لمنصة مناسبات وادخل بالسباق الشهري — أفضل ٣ داعين كل شهر يفوزون بجوائز نقدية.",
  alternates: { canonical: "/pages/referrals" },
};

export const revalidate = 3600;

const MEDALS = ["🥇", "🥈", "🥉"];

const STEPS = [
  { icon: Link2, title: "انسخ رابطك الخاص", body: "من صفحة «الإحالات» بلوحة التحكم بعد تسجيل الدخول، تلقى رابط دعوة فريد باسم مستخدمك." },
  { icon: MessageCircle, title: "شاركه", body: "أرسله لأصدقائك عبر واتساب أو أي وسيلة تحب — كل ما احتجت غير رابط النسخ أو زر المشاركة الجاهز." },
  { icon: UserPlus, title: "يكمّل صديقك تسجيله", body: "بمجرد ما يفتح حساب ويختار اسم مستخدم، تُحسب لك الدعوة تلقائياً — بغض النظر إن كان بائع أو زبون." },
];

export default async function ReferralsPage() {
  const supabase = createPublicClient();

  const [{ data: prizeRows }, pastMonths] = await Promise.all([
    supabase.from("admin_settings").select("key,value").in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]),
    getPastMonthsReferralLeaderboards(supabase, 3, 3),
  ]);

  const prizes: number[] = [300, 150, 50];
  for (const row of prizeRows ?? []) {
    const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
    if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-1">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">برنامج الإحالة</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          ادعُ أصدقاءك لمنصة مناسبات — أفضل ٣ داعين كل شهر يفوزون بجوائز نقدية تُدفع لهم مباشرة. الترتيب يتصفّر أول كل شهر جديد.
        </p>

        <div className="mb-6">
          <ReferralCountdown />
        </div>

        <Link
          href="/dashboard/referrals"
          className="flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-bold mb-10 hover:bg-[#5b21b6] transition-colors"
        >
          احصل على رابط دعوتك الآن <ArrowLeft size={15} />
        </Link>

        {/* الجوائز الحالية */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {prizes.map((p, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">{MEDALS[i]}</p>
              <p className="text-xs text-gray-400 mb-1">المركز {i === 0 ? "الأول" : i === 1 ? "الثاني" : "الثالث"}</p>
              <p className="text-lg font-bold text-[#6D28D9]">{formatNumber(p)} ر.س</p>
            </div>
          ))}
        </div>

        {/* كيف تشارك */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">كيف تشارك؟</h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                  <step.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* الفائزون السابقون */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-[#6D28D9]" /> الفائزون السابقون
          </h2>
          {pastMonths.length === 0 ? (
            <p className="text-sm text-gray-400 bg-white border border-gray-100 rounded-2xl p-5 text-center">
              لا يوجد فائزون بعد — كن أول من يتصدّر الترتيب!
            </p>
          ) : (
            <div className="space-y-4">
              {pastMonths.map((month) => (
                <div key={month.monthLabel} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 mb-3">{month.monthLabel}</p>
                  <div className="space-y-2">
                    {month.rows.map((row, i) => (
                      <div key={row.referrer_id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{MEDALS[i]}</span>
                          <span className="font-medium text-gray-900">{row.display_name}</span>
                        </span>
                        <span className="text-gray-400" dir="ltr">{formatNumber(row.referral_count)} إحالة</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

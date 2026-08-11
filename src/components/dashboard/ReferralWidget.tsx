"use client";

import { useState } from "react";
import { Trophy, Copy, Check, MessageCircle, Flame } from "lucide-react";
import { formatNumber } from "@/lib/formatTime";
import { ReferralLeaderboardRow } from "@/lib/referral";
import ReferralCountdown from "@/components/dashboard/ReferralCountdown";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ReferralWidget({
  username,
  referralCount = 0,
  leaderboard = [],
  prizes = [300, 150, 50],
  standalone = false,
}: {
  username: string;
  referralCount?: number;
  leaderboard?: ReferralLeaderboardRow[];
  prizes?: number[];
  standalone?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${username}` : `/?ref=${username}`;
  const whatsappText = `أنصحك بمنصة مناسبات — تصفّح قاعات وضيافة وتصوير وكل خدمات المناسبات بمكان واحد، وتواصل مباشر بدون وسيط: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const myRank = leaderboard.findIndex((r) => r.username === username);

  // فجوة الدعوات المتبقية عشان يدخل المركز الثالث (أو يتقدّم عليه) — تحفيز مباشر وملموس
  const thirdPlaceCount = leaderboard[2]?.referral_count ?? 0;
  const gapToThird = myRank >= 0 ? 0 : Math.max(0, thirdPlaceCount - referralCount + 1);

  return (
    <div className={standalone ? "" : "pt-4 border-t border-gray-100"}>
      <div className="bg-gradient-to-bl from-[#6D28D9] to-[#8B5CF6] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} />
          <p className="text-sm font-bold">أفضل ٣ داعين كل شهر يفوزون بجوائز نقدية</p>
        </div>
        <p className="text-xs text-purple-100 mb-3">
          كل شخص تدعوه ويكمّل تسجيله يُحسب لك — الأول {formatNumber(prizes[0])} ر.س، الثاني {formatNumber(prizes[1])} ر.س، الثالث {formatNumber(prizes[2])} ر.س. الترتيب يتصفّر كل شهر جديد.
        </p>

        <div className="mb-3">
          <ReferralCountdown variant="dark" />
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mb-2">
          <span dir="ltr" className="text-xs truncate flex-1">{link}</span>
          <button onClick={copy} className="shrink-0 flex items-center gap-1 bg-white text-[#6D28D9] rounded-lg px-2.5 py-1 text-xs font-medium">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "تم النسخ" : "نسخ"}
          </button>
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-2 text-xs font-bold mb-3"
        >
          <MessageCircle size={14} />
          شارك عبر واتساب
        </a>

        <div className="bg-white/10 rounded-xl px-3 py-2.5 mb-2">
          <p className="text-xs font-bold">
            دعواتك هذا الشهر: <span className="text-sm">{formatNumber(referralCount)}</span>
            {myRank >= 0 && <span className="text-purple-100"> — ترتيبك الحالي {MEDALS[myRank]} #{myRank + 1}</span>}
          </p>
        </div>

        {referralCount === 0 ? (
          <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 rounded-xl px-3 py-2 mb-2">
            <Flame size={14} className="text-amber-300 shrink-0" />
            <p className="text-xs font-bold">ابدأ الآن — أول دعوة لك تدخلك السباق مباشرة!</p>
          </div>
        ) : (
          gapToThird > 0 && (
            <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 rounded-xl px-3 py-2 mb-2">
              <Flame size={14} className="text-amber-300 shrink-0" />
              <p className="text-xs font-bold">
                باقي لك {formatNumber(gapToThird)} {gapToThird === 1 ? "دعوة" : "دعوات"} بس عشان تدخل قائمة الفائزين!
              </p>
            </div>
          )
        )}

        {leaderboard.length > 0 && (
          <div className="space-y-1.5">
            {leaderboard.map((row, i) => (
              <div
                key={row.referrer_id}
                className={`flex items-center justify-between text-xs rounded-lg px-3 py-1.5 ${
                  row.username === username ? "bg-white/25 font-bold" : "bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span>{MEDALS[i]}</span>
                  <span className="truncate">{row.display_name}</span>
                </span>
                <span dir="ltr">{formatNumber(row.referral_count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

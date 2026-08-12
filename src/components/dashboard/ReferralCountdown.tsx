"use client";

import { useEffect, useState } from "react";
import { Clock, Coffee } from "lucide-react";

function timeLeft(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return { days, hours, minutes };
}

// عدّاد حي للوقت المتبقي — إمّا على انتهاء السباق الحالي (٥٥ يوم) أو على بداية السباق الجديد
// بعد الاستراحة (٥ أيام) — targetDate وphase تجيان جاهزتين من السيرفر (getReferralCycleDisplayInfo)
export default function ReferralCountdown({
  targetDate,
  phase = "race",
  variant = "light",
}: {
  targetDate: string;
  phase?: "race" | "break";
  variant?: "light" | "dark";
}) {
  const [t, setT] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    setT(timeLeft(targetDate));
    const id = setInterval(() => setT(timeLeft(targetDate)), 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!t) return null;

  if (phase === "break") {
    const base = variant === "dark" ? "bg-white/10 text-white" : "bg-gray-50 text-gray-600 border border-gray-100";
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${base}`}>
        <Coffee size={13} className="shrink-0" />
        <span>
          السباق بأخذ استراحة قصيرة — يبدأ سباق جديد خلال {t.days > 0 ? `${t.days} يوم و` : ""}
          {t.hours} ساعة
        </span>
      </div>
    );
  }

  const urgent = t.days < 3;
  const base = variant === "dark" ? "bg-white/10 text-white" : "bg-amber-50 text-amber-800 border border-amber-100";
  const urgentCls = variant === "dark" ? "bg-white/20 text-white animate-pulse" : "bg-red-50 text-red-700 border border-red-100 animate-pulse";

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${urgent ? urgentCls : base}`}>
      <Clock size={13} className="shrink-0" />
      <span>
        {urgent ? "🔥 آخر فرصة — " : ""}
        متبقي على انتهاء السباق:{" "}
        {t.days > 0 ? `${t.days} يوم و` : ""}
        {t.hours} ساعة
        {t.days === 0 ? ` و${t.minutes} دقيقة` : ""}
      </span>
    </div>
  );
}

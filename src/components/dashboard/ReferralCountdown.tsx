"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function timeLeft() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const ms = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return { days, hours, minutes };
}

// عدّاد حي للوقت المتبقي على انتهاء السباق الشهري — يتحدّث كل دقيقة، يعطي إحساس إلحاح حقيقي
export default function ReferralCountdown({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [t, setT] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    setT(timeLeft());
    const id = setInterval(() => setT(timeLeft()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!t) return null;

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

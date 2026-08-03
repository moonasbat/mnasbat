"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function AdRenewBanner({
  adId,
  status,
  daysUntilExpiry,
}: {
  adId: string;
  status: "published" | "expired" | "paused";
  daysUntilExpiry: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function renew() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "تعذر تجديد الإعلان.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-2xl p-4">
        تم تجديد الإعلان بنجاح ✓
      </div>
    );
  }

  const message =
    status === "expired"
      ? "انتهت مدة نشر هذا الإعلان — جدده ليعود للظهور للمهتمين."
      : status === "paused"
        ? "هذا الإعلان متوقف مؤقتاً — جدده لإعادة تفعيله."
        : `ينتهي هذا الإعلان خلال ${daysUntilExpiry} ${daysUntilExpiry === 1 ? "يوم" : "أيام"} — جدده قبل أن يتوقف ظهوره.`;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-amber-800">{message}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={renew}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "جارٍ التجديد…" : "تجديد الإعلان"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ad, Category } from "@/lib/types";
import EditAdForm from "@/components/ads/EditAdForm";
import { Pencil, HandCoins, RefreshCw, Check, X } from "lucide-react";

const RENEW_COOLDOWN_DAYS = 5;

// نحسب الوقت المتبقي محلياً قبل ما نرسل أي طلب — يعرض للمستخدم فوراً بدون انتظار رد السيرفر
function renewCooldownText(publishedAt: string | null | undefined): string | null {
  if (!publishedAt) return null;
  const cooldownMs = RENEW_COOLDOWN_DAYS * 86400000;
  const elapsedMs = Date.now() - new Date(publishedAt).getTime();
  if (elapsedMs >= cooldownMs) return null;
  const remainingMs = cooldownMs - elapsedMs;
  const remainingDays = Math.floor(remainingMs / 86400000);
  const remainingHours = Math.ceil((remainingMs - remainingDays * 86400000) / 3600000);
  return remainingDays > 0
    ? `${remainingDays} ${remainingDays === 1 ? "يوم" : "أيام"}`
    : `${remainingHours} ${remainingHours === 1 ? "ساعة" : "ساعات"}`;
}

export default function AdOwnerPanel({
  ad,
  categories,
  maxImages,
  renewalEnabled,
}: {
  ad: Ad;
  categories: Category[];
  maxImages: number;
  renewalEnabled: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [renewError, setRenewError] = useState("");
  const cooldown = renewCooldownText(ad.published_at);

  async function renew() {
    if (cooldown) {
      setRenewError(`يمكنك تجديد الإعلان بعد ${cooldown}.`);
      return;
    }
    setRenewing(true);
    setRenewError("");
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renew" }),
    });
    setRenewing(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRenewError(data.error || "تعذر تجديد الإعلان.");
      return;
    }
    setRenewed(true);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-sm">تعديل الإعلان</h2>
          <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <X size={14} />
            إغلاق
          </button>
        </div>
        <EditAdForm ad={ad} categories={categories} maxImages={maxImages} />
      </div>
    );
  }

  // التجديد متاح دائماً لأي إعلان منشور فعلياً (مو بس قرب الانتهاء) — نفس فكرة "تنشيط الإعلان" في حراج
  const showRenew = renewalEnabled && ad.status !== "draft";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
      <h2 className="font-bold text-gray-900 text-sm">إدارة إعلانك</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors"
        >
          <Pencil size={14} />
          تعديل الإعلان
        </button>
        {showRenew && (
          <button
            onClick={renew}
            disabled={renewing}
            className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors disabled:opacity-60"
          >
            {renewed ? <Check size={14} /> : <RefreshCw size={14} className={renewing ? "animate-spin" : ""} />}
            {renewing ? "جارٍ التجديد…" : renewed ? "تم التجديد" : "تجديد الإعلان"}
          </button>
        )}
        <Link
          href={`/commission?ad=${ad.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors"
        >
          <HandCoins size={14} />
          دفع العمولة
        </Link>
      </div>
      {renewError && <p className="text-xs text-red-600">{renewError}</p>}
    </div>
  );
}

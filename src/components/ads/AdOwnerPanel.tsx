"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ad, Category } from "@/lib/types";
import EditAdForm from "@/components/ads/EditAdForm";
import {
  Pencil, RefreshCw, Check, X, Trash2, ChevronDown,
  Eye, Heart, MessageSquare, MessageCircle, Share2, Phone, Images, CalendarDays, BarChart3,
} from "lucide-react";

// نحسب الوقت المتبقي محلياً قبل ما نرسل أي طلب — يعرض للمستخدم فوراً بدون انتظار رد السيرفر
function renewCooldownText(publishedAt: string | null | undefined, cooldownDays: number): string | null {
  if (!publishedAt) return null;
  const cooldownMs = cooldownDays * 86400000;
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
  renewalCooldownDays,
  whatsappClicks,
  imagesCount,
  daysSincePublished,
}: {
  ad: Ad;
  categories: Category[];
  maxImages: number;
  renewalEnabled: boolean;
  renewalCooldownDays: number;
  whatsappClicks: number;
  imagesCount: number;
  daysSincePublished: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [renewError, setRenewError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const cooldown = renewCooldownText(ad.published_at, renewalCooldownDays);

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

  async function remove() {
    if (!confirm("هل تريد حذف هذا الإعلان نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setDeleting(true);
    const res = await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      alert("تعذر حذف الإعلان.");
      return;
    }
    router.push("/dashboard/ads");
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

  const stats = [
    { label: "مشاهدة", value: ad.views_count, icon: Eye },
    { label: "مفضلة", value: ad.favorites_count, icon: Heart },
    { label: "رسالة", value: ad.messages_count, icon: MessageSquare },
    { label: "تعليق", value: ad.comments_count, icon: MessageCircle },
    { label: "مشاركة", value: ad.shares_count, icon: Share2 },
    { label: "نقرة واتساب", value: whatsappClicks, icon: Phone },
    { label: "صورة", value: imagesCount, icon: Images },
    { label: "يوم منذ النشر", value: daysSincePublished, icon: CalendarDays },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
      <h2 className="font-bold text-gray-900 text-sm mb-2">إدارة إعلانك</h2>
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
        <button
          onClick={() => setStatsOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors"
        >
          <BarChart3 size={14} />
          إحصائيات الإعلان
          <ChevronDown size={14} className={`transition-transform ${statsOpen ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={remove}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl px-3 py-2 hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          <Trash2 size={14} />
          {deleting ? "جارٍ الحذف…" : "حذف الإعلان"}
        </button>
      </div>
      {renewError && <p className="text-xs text-red-600">{renewError}</p>}

      {statsOpen && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <Icon size={16} className="text-[#6D28D9] mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

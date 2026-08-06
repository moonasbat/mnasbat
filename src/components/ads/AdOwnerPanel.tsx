"use client";

import { useState } from "react";
import Link from "next/link";
import { Ad, Category } from "@/lib/types";
import EditAdForm from "@/components/ads/EditAdForm";
import AdRenewBanner from "@/components/ads/AdRenewBanner";
import { Pencil, HandCoins, X } from "lucide-react";

const RENEW_WINDOW_DAYS = 7;

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
  const [editing, setEditing] = useState(false);

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

  const daysUntilExpiry = ad.expires_at ? Math.ceil((new Date(ad.expires_at).getTime() - Date.now()) / 86400000) : null;
  const showRenew =
    renewalEnabled &&
    (ad.status === "expired" || ad.status === "paused" || (ad.status === "published" && daysUntilExpiry !== null && daysUntilExpiry <= RENEW_WINDOW_DAYS));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
      <h2 className="font-bold text-gray-900 text-sm">إدارة إعلانك</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors"
        >
          <Pencil size={14} />
          تعديل الإعلان
        </button>
        <Link
          href={`/commission?ad=${ad.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6D28D9] bg-purple-50 rounded-xl px-3 py-2 hover:bg-purple-100 transition-colors"
        >
          <HandCoins size={14} />
          دفع العمولة
        </Link>
      </div>
      {showRenew && (
        <AdRenewBanner adId={ad.id} status={ad.status as "published" | "expired" | "paused"} daysUntilExpiry={daysUntilExpiry} />
      )}
    </div>
  );
}

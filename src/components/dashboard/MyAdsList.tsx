"use client";

import { useState } from "react";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import { adUrl } from "@/lib/adSlug";
import AdActions from "@/components/dashboard/AdActions";
import Link from "next/link";
import Image from "next/image";
import { HandCoins } from "lucide-react";

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export default function MyAdsList({
  initialAds,
  showStats,
  renewalEnabled,
}: {
  initialAds: Ad[];
  showStats: boolean;
  renewalEnabled: boolean;
}) {
  const [ads, setAds] = useState(initialAds);

  if (ads.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-16">لا توجد إعلانات بعد.</p>;
  }

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <div key={ad.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {ad.ad_images?.[0] ? (
              <Image src={ad.ad_images[0].url} alt={ad.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={adUrl(ad)} className="font-medium text-gray-900 text-sm hover:underline truncate">{ad.title}</Link>
              <span className={`text-xs rounded-lg px-2 py-0.5 shrink-0 ${ad.status === "expired" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                {AD_STATUS_LABELS[ad.status]}
              </span>
            </div>
            {ad.status === "published" && ad.expires_at && daysUntil(ad.expires_at) <= 7 && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                ينتهي خلال {daysUntil(ad.expires_at)} {daysUntil(ad.expires_at) === 1 ? "يوم" : "أيام"} — جدده قبل أن يتوقف ظهوره
              </p>
            )}
            {showStats && (
              <p className="text-xs text-gray-400 mt-1">
                {ad.views_count} مشاهدة · {ad.messages_count} رسالة · {ad.favorites_count} مفضلة
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <AdActions
                adId={ad.id}
                status={ad.status}
                renewalEnabled={renewalEnabled}
                onDeleted={() => setAds((prev) => prev.filter((a) => a.id !== ad.id))}
              />
              {ad.status === "published" && (
                <Link
                  href={`/commission?ad=${ad.id}`}
                  className="flex items-center gap-1 text-xs text-[#6D28D9] font-medium hover:underline"
                >
                  <HandCoins size={13} />
                  تمت صفقة بسبب هذا الإعلان؟
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

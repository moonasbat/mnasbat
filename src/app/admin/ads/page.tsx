import { createAdminClient } from "@/lib/supabase/admin";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import AdminAdActions from "@/components/admin/AdminAdActions";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Download } from "lucide-react";
import { formatNumber } from "@/lib/formatTime";
import { adUrl } from "@/lib/adSlug";

export default async function AdminAdsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const admin = createAdminClient();
  const activeStatus = status ?? "pending_review";

  let query = admin
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (activeStatus !== "all") query = query.eq("status", activeStatus);

  const { data: ads } = await query;

  const statuses: [string, string][] = [
    ["pending_review", "قيد المراجعة"],
    ["published", "منشور"],
    ["paused", "موقوف"],
    ["rejected", "مرفوض"],
    ["expired", "منتهٍ"],
    ["removed", "محذوف"],
    ["all", "الكل"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">مراجعة الإعلانات</h1>
          <p className="text-sm text-gray-500 mt-1">
            راجع الصورة والوصف قبل الاعتماد أو الرفض — لا حاجة لمغادرة هذه الصفحة.
          </p>
        </div>
        <a href="/api/admin/export?type=ads" className="flex items-center gap-1.5 text-sm text-[#6D28D9] hover:underline shrink-0">
          <Download size={15} />
          تصدير CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(([key, label]) => (
          <a
            key={key}
            href={`/admin/ads?status=${key}`}
            className={`px-3 py-1.5 rounded-xl text-xs ${activeStatus === key ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600"}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {(ads as Ad[])?.map((ad) => {
          const image = ad.ad_images?.[0]?.url;
          return (
            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {image ? (
                  <Image src={image} alt={ad.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{ad.title}</h3>
                      <span className="text-xs bg-gray-100 rounded-lg px-2 py-0.5 shrink-0">{AD_STATUS_LABELS[ad.status]}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ad.profiles?.display_name} · {ad.categories?.name} {ad.city ? `· ${ad.city}` : ""}
                      {ad.price ? ` · ${formatNumber(ad.price)} ر.س` : ""}
                    </p>
                  </div>
                  <Link href={adUrl(ad)} target="_blank" className="flex items-center gap-1 text-xs text-[#6D28D9] shrink-0 hover:underline">
                    فتح الصفحة الكاملة
                    <ExternalLink size={12} />
                  </Link>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ad.description}</p>

                {ad.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1">سبب الرفض: {ad.rejection_reason}</p>
                )}

                <div className="mt-3">
                  <AdminAdActions adId={ad.id} status={ad.status} />
                </div>
              </div>
            </div>
          );
        })}
        {(!ads || ads.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-10 bg-white rounded-2xl border border-gray-100">
            لا توجد إعلانات في هذا التصنيف حالياً.
          </p>
        )}
      </div>
    </div>
  );
}

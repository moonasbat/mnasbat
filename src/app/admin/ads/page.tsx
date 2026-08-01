import { createAdminClient } from "@/lib/supabase/admin";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import AdminAdActions from "@/components/admin/AdminAdActions";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Download, Megaphone, Eye, Heart } from "lucide-react";
import { formatNumber } from "@/lib/formatTime";
import { adUrl } from "@/lib/adSlug";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

const STATUS_COLOR: Record<string, "green" | "amber" | "gray" | "red"> = {
  published: "green",
  pending_review: "amber",
  paused: "gray",
  rejected: "red",
  expired: "gray",
  removed: "red",
  draft: "gray",
  archived: "gray",
};

const PAGE_SIZE = 20;

export default async function AdminAdsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { status, page: pageParam } = await searchParams;
  const activeStatus = status ?? "pending_review";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();

  let query = admin
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)")
    .order("created_at", { ascending: false })
    .range(from, to + 1);
  if (activeStatus !== "all") query = query.eq("status", activeStatus);

  const { data: rows } = await query;
  const ads = (rows ?? []).slice(0, PAGE_SIZE) as Ad[];
  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;

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
      <PageHeader
        title="مراجعة الإعلانات"
        subtitle="راجع الصورة والوصف قبل الاعتماد أو الرفض — لا حاجة لمغادرة هذه الصفحة."
        action={
          <a href="/api/admin/export?type=ads" className="flex items-center gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-gray-600 hover:border-gray-300">
            <Download size={15} />
            تصدير CSV
          </a>
        }
      />

      <div className="flex flex-wrap gap-2">
        {statuses.map(([key, label]) => (
          <a
            key={key}
            href={`/admin/ads?status=${key}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeStatus === key ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {ads.map((ad) => {
          const image = ad.ad_images?.[0]?.url;
          return (
            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:border-gray-200 transition-colors">
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
                      <Link href={`/admin/ads/${ad.id}`} className="font-bold text-gray-900 hover:underline">{ad.title}</Link>
                      <Badge color={STATUS_COLOR[ad.status] ?? "gray"}>{AD_STATUS_LABELS[ad.status]}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ad.profiles?.display_name} · {ad.categories?.name} {ad.city ? `· ${ad.city}` : ""}
                      {ad.price ? ` · ${formatNumber(ad.price)} ر.س` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(ad.views_count ?? 0)}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(ad.favorites_count ?? 0)}</span>
                    </div>
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
        {ads.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={Megaphone} title="لا توجد إعلانات في هذا التصنيف حالياً" />
          </div>
        )}
      </div>

      {ads.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <Pagination page={page} hasMore={hasMore} basePath="/admin/ads" extraParams={{ status: activeStatus }} />
        </div>
      )}
    </div>
  );
}

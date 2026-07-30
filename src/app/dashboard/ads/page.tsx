import { createClient } from "@/lib/supabase/server";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import AdActions from "@/components/dashboard/AdActions";
import Link from "next/link";
import Image from "next/image";
import { Plus, HandCoins } from "lucide-react";

export default async function MyAdsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ads } = await supabase
    .from("ads")
    .select("*, categories(*), ad_images(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">إعلاناتي</h1>
        <Link href="/ads/new" className="flex items-center gap-1.5 bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={16} />
          أضف إعلان
        </Link>
      </div>

      {ads && ads.length > 0 ? (
        <div className="space-y-3">
          {(ads as Ad[]).map((ad) => (
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
                  <Link href={`/ads/${ad.id}`} className="font-medium text-gray-900 text-sm hover:underline truncate">{ad.title}</Link>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-lg px-2 py-0.5 shrink-0">{AD_STATUS_LABELS[ad.status]}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ad.views_count} مشاهدة · {ad.messages_count} رسالة · {ad.favorites_count} مفضلة
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <AdActions adId={ad.id} status={ad.status} />
                  {ad.status === "published" && (
                    <Link
                      href={`/dashboard/commission?ad=${ad.id}`}
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
      ) : (
        <p className="text-sm text-gray-400 text-center py-16">لا توجد إعلانات بعد.</p>
      )}
    </div>
  );
}

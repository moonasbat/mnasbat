import { createAdminClient } from "@/lib/supabase/admin";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import AdminAdActions from "@/components/admin/AdminAdActions";

export default async function AdminAdsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const admin = createAdminClient();

  let query = admin.from("ads").select("*, profiles(*), categories(*)").order("created_at", { ascending: false }).limit(100);
  if (status) query = query.eq("status", status);

  const { data: ads } = await query;

  const statuses = ["pending_review", "published", "paused", "rejected", "expired", "removed"];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">الإعلانات</h1>

      <div className="flex flex-wrap gap-2">
        <a href="/admin/ads" className={`px-3 py-1.5 rounded-xl text-xs ${!status ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200"}`}>الكل</a>
        {statuses.map((s) => (
          <a key={s} href={`/admin/ads?status=${s}`} className={`px-3 py-1.5 rounded-xl text-xs ${status === s ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200"}`}>
            {AD_STATUS_LABELS[s]}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">العنوان</th>
              <th className="text-right px-4 py-3">المعلن</th>
              <th className="text-right px-4 py-3">التصنيف</th>
              <th className="text-right px-4 py-3">الحالة</th>
              <th className="text-right px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(ads as Ad[])?.map((ad) => (
              <tr key={ad.id}>
                <td className="px-4 py-3"><a href={`/ads/${ad.id}`} className="hover:underline text-gray-900">{ad.title}</a></td>
                <td className="px-4 py-3 text-gray-500">{ad.profiles?.display_name}</td>
                <td className="px-4 py-3 text-gray-500">{ad.categories?.name}</td>
                <td className="px-4 py-3"><span className="bg-gray-100 rounded-lg px-2 py-1 text-xs">{AD_STATUS_LABELS[ad.status]}</span></td>
                <td className="px-4 py-3"><AdminAdActions adId={ad.id} status={ad.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!ads || ads.length === 0) && <p className="text-center text-sm text-gray-400 py-10">لا توجد إعلانات.</p>}
      </div>
    </div>
  );
}

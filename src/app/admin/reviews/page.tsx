import { createAdminClient } from "@/lib/supabase/admin";
import { Review } from "@/lib/types";
import AdminReviewActions from "@/components/admin/AdminReviewActions";

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(display_name), reviewee:profiles!reviews_reviewee_id_fkey(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">التقييمات المنتظرة</h1>

      <div className="space-y-2">
        {(reviews as unknown as (Review & { reviewer: { display_name: string }; reviewee: { display_name: string } })[])?.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className={r.is_positive ? "text-green-600 text-sm" : "text-red-500 text-sm"}>
                {r.is_positive ? "إيجابي" : "سلبي"} — {r.reviewer?.display_name} ← {r.reviewee?.display_name}
              </span>
              <AdminReviewActions reviewId={r.id} />
            </div>
            <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
          </div>
        ))}
        {(!reviews || reviews.length === 0) && <p className="text-sm text-gray-400 text-center py-10">لا توجد تقييمات بانتظار الموافقة.</p>}
      </div>
    </div>
  );
}

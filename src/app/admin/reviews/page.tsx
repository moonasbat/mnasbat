import { createAdminClient } from "@/lib/supabase/admin";
import { Review } from "@/lib/types";
import AdminReviewActions from "@/components/admin/AdminReviewActions";
import { StarRatingDisplay } from "@/components/StarRating";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(display_name), reviewee:profiles!reviews_reviewee_id_fkey(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const list = reviews as unknown as (Review & { reviewer: { display_name: string }; reviewee: { display_name: string } })[] | null;

  return (
    <div className="space-y-4">
      <PageHeader title="التقييمات المنتظرة" subtitle="تقييمات بانتظار موافقتك قبل ظهورها في الملفات الشخصية." />

      <div className="space-y-2">
        {list?.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <StarRatingDisplay value={r.rating} />
                <span className="text-gray-500">— {r.reviewer?.display_name} ← {r.reviewee?.display_name}</span>
              </div>
              <AdminReviewActions reviewId={r.id} />
            </div>
            <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
          </div>
        ))}
        {(!list || list.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={Star} title="لا توجد تقييمات بانتظار الموافقة" />
          </div>
        )}
      </div>
    </div>
  );
}

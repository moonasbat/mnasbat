import { createAdminClient } from "@/lib/supabase/admin";
import { Report } from "@/lib/types";
import AdminReportActions from "@/components/admin/AdminReportActions";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import { Flag } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  in_review: "قيد المراجعة",
  needs_info: "يحتاج معلومات",
  closed: "مغلق",
  action_taken: "إجراء متخذ",
};

const STATUS_COLOR: Record<string, "amber" | "blue" | "gray" | "green"> = {
  new: "amber",
  in_review: "blue",
  needs_info: "amber",
  closed: "gray",
  action_taken: "green",
};

export default async function AdminReportsPage() {
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("*, profiles!reports_reporter_id_fkey(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = reports as (Report & { profiles: { display_name: string } })[] | null;

  return (
    <div className="space-y-4">
      <PageHeader title="البلاغات" subtitle="بلاغات المستخدمين عن إعلانات أو حسابات مخالفة." />

      <div className="space-y-2">
        {list?.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-gray-900">{r.reason}</span>
              <Badge color={STATUS_COLOR[r.status] ?? "gray"}>{STATUS_LABELS[r.status]}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">النوع: {r.target_type} · بواسطة: {r.profiles?.display_name}</p>
            {r.details && <p className="text-sm text-gray-700 mt-2">{r.details}</p>}
            <div className="mt-3">
              <AdminReportActions reportId={r.id} />
            </div>
          </div>
        ))}
        {(!list || list.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={Flag} title="لا توجد بلاغات حالياً" body="ستظهر هنا أي بلاغات جديدة يرسلها المستخدمون." />
          </div>
        )}
      </div>
    </div>
  );
}

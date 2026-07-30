import { createAdminClient } from "@/lib/supabase/admin";
import { Report } from "@/lib/types";
import AdminReportActions from "@/components/admin/AdminReportActions";

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  in_review: "قيد المراجعة",
  needs_info: "يحتاج معلومات",
  closed: "مغلق",
  action_taken: "إجراء متخذ",
};

export default async function AdminReportsPage() {
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("*, profiles!reports_reporter_id_fkey(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">البلاغات</h1>

      <div className="space-y-2">
        {(reports as (Report & { profiles: { display_name: string } })[])?.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{r.reason}</span>
              <span className="text-xs bg-gray-100 rounded-lg px-2 py-1">{STATUS_LABELS[r.status]}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">النوع: {r.target_type} · بواسطة: {r.profiles?.display_name}</p>
            {r.details && <p className="text-sm text-gray-700 mt-2">{r.details}</p>}
            <div className="mt-3">
              <AdminReportActions reportId={r.id} />
            </div>
          </div>
        ))}
        {(!reports || reports.length === 0) && <p className="text-sm text-gray-400 text-center py-10">لا توجد بلاغات.</p>}
      </div>
    </div>
  );
}

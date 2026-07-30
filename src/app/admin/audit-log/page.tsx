import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLog } from "@/lib/types";
import { formatGregorianDateTime } from "@/lib/formatTime";

export default async function AuditLogPage() {
  const admin = createAdminClient();
  const { data: logs } = await admin
    .from("audit_logs")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">سجل التدقيق</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">الإجراء</th>
              <th className="text-right px-4 py-3">بواسطة</th>
              <th className="text-right px-4 py-3">الهدف</th>
              <th className="text-right px-4 py-3">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(logs as AuditLog[])?.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 text-gray-900">{l.action}</td>
                <td className="px-4 py-3 text-gray-500">{l.profiles?.display_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{l.target_type} / {l.target_id?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatGregorianDateTime(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

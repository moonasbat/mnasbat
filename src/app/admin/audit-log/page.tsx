import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLog } from "@/lib/types";
import { formatGregorianDateTime } from "@/lib/formatTime";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { ScrollText } from "lucide-react";

const PAGE_SIZE = 40;

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("audit_logs")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false })
    .range(from, to + 1);

  const logs = (rows ?? []).slice(0, PAGE_SIZE) as AuditLog[];
  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;

  return (
    <div className="space-y-4">
      <PageHeader title="سجل التدقيق" subtitle="كل إجراء إداري مسجّل هنا مع الوقت والمسؤول عنه." />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {logs.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الإجراء</th>
                <th className="text-right px-4 py-3 font-medium">بواسطة</th>
                <th className="text-right px-4 py-3 font-medium">الهدف</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">{l.action}</td>
                  <td className="px-4 py-3 text-gray-500">{l.profiles?.display_name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{l.target_type} / {l.target_id?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatGregorianDateTime(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={ScrollText} title="لا يوجد نشاط مسجّل بعد" />
        )}
        <Pagination page={page} hasMore={hasMore} basePath="/admin/audit-log" />
      </div>
    </div>
  );
}

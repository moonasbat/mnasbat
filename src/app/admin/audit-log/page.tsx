import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLog } from "@/lib/types";
import { formatGregorianDateTime } from "@/lib/formatTime";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { ScrollText } from "lucide-react";
import { formatAuditAction, TARGET_TYPE_LABELS, TARGET_TYPE_COLORS } from "@/lib/auditLog";
import Badge from "@/components/admin/Badge";

const PAGE_SIZE = 40;

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string; type?: string }> }) {
  const { page: pageParam, type } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();
  const [{ data: rows }, { data: flagRows }] = await Promise.all([
    (() => {
      let q = admin.from("audit_logs").select("*, profiles(display_name)").order("created_at", { ascending: false }).range(from, to + 1);
      if (type) q = q.eq("target_type", type);
      return q;
    })(),
    admin.from("feature_flags").select("key,label"),
  ]);

  const flagLabels: Record<string, string> = {};
  (flagRows ?? []).forEach((r) => (flagLabels[r.key] = r.label ?? r.key));

  const logs = (rows ?? []).slice(0, PAGE_SIZE) as (AuditLog & { profiles: { display_name: string } | null })[];
  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;

  const types = Object.keys(TARGET_TYPE_LABELS);

  return (
    <div className="space-y-4">
      <PageHeader title="سجل التدقيق" subtitle="كل إجراء إداري مسجّل هنا بصياغة عربية واضحة، مع الوقت والمسؤول عنه." />

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/audit-log"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${!type ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
        >
          الكل
        </a>
        {types.map((t) => (
          <a
            key={t}
            href={`/admin/audit-log?type=${t}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${type === t ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            {TARGET_TYPE_LABELS[t]}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {logs.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الإجراء</th>
                <th className="text-right px-4 py-3 font-medium">بواسطة</th>
                <th className="text-right px-4 py-3 font-medium">النوع</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-900">{formatAuditAction(l, flagLabels)}</td>
                  <td className="px-4 py-3 text-gray-500">{l.profiles?.display_name ?? "النظام"}</td>
                  <td className="px-4 py-3">
                    {l.target_type && <Badge color={TARGET_TYPE_COLORS[l.target_type] ?? "gray"}>{TARGET_TYPE_LABELS[l.target_type] ?? l.target_type}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatGregorianDateTime(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={ScrollText} title="لا يوجد نشاط مسجّل بعد" />
        )}
        <Pagination page={page} hasMore={hasMore} basePath="/admin/audit-log" extraParams={type ? { type } : undefined} />
      </div>
    </div>
  );
}

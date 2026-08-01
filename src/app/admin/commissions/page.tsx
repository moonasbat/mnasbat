import { createAdminClient } from "@/lib/supabase/admin";
import AdminCommissionActions from "@/components/admin/AdminCommissionActions";
import { CommissionPayment } from "@/lib/types";
import { formatNumber } from "@/lib/formatTime";
import { Download, Receipt } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import Badge from "@/components/admin/Badge";

export default async function AdminCommissionsPage() {
  const admin = createAdminClient();
  const { data: payments } = await admin
    .from("commission_payments")
    .select("*, commission_obligations(amount, deal_value, ad_id, ad_reference_text, user_id, ads(title), profiles(display_name))")
    .in("status", ["pending", "needs_info"])
    .order("created_at", { ascending: false });

  const list = payments as unknown as (CommissionPayment & {
    commission_obligations: { amount: number; ad_reference_text?: string; ads?: { title: string }; profiles: { display_name: string } };
  })[] | null;

  const totalPending = (list ?? []).reduce((s, p) => s + Number(p.commission_obligations?.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="إيصالات التحويل"
        subtitle={list && list.length > 0 ? `${list.length} إيصال بانتظار المراجعة بقيمة ${formatNumber(totalPending)} ر.س` : "إيصالات دفع العمولة بانتظار مراجعتك."}
        action={
          <a href="/api/admin/export?type=commissions" className="flex items-center gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-gray-600 hover:border-gray-300">
            <Download size={15} />
            تصدير CSV
          </a>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {list && list.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الإعلان</th>
                <th className="text-right px-4 py-3 font-medium">المعلن</th>
                <th className="text-right px-4 py-3 font-medium">المبلغ</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">الإيصال</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    {p.commission_obligations?.ads?.title ?? (
                      <span className="text-amber-600">{p.commission_obligations?.ad_reference_text ?? "إعلان قديم"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.commission_obligations?.profiles?.display_name}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatNumber(Number(p.commission_obligations?.amount))} ر.س</td>
                  <td className="px-4 py-3"><Badge color={p.status === "needs_info" ? "amber" : "blue"}>{p.status === "needs_info" ? "يحتاج معلومات" : "قيد المراجعة"}</Badge></td>
                  <td className="px-4 py-3">
                    {p.receipt_url && <a href={p.receipt_url} target="_blank" className="text-[#6D28D9] hover:underline">عرض الإيصال</a>}
                  </td>
                  <td className="px-4 py-3"><AdminCommissionActions paymentId={p.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={Receipt} title="لا توجد إيصالات بانتظار المراجعة" />
        )}
      </div>
    </div>
  );
}

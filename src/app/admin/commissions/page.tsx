import { createAdminClient } from "@/lib/supabase/admin";
import AdminCommissionActions from "@/components/admin/AdminCommissionActions";
import { CommissionPayment } from "@/lib/types";
import { formatNumber } from "@/lib/formatTime";

export default async function AdminCommissionsPage() {
  const admin = createAdminClient();
  const { data: payments } = await admin
    .from("commission_payments")
    .select("*, commission_obligations(amount, deal_value, ad_id, ad_reference_text, user_id, ads(title), profiles(display_name))")
    .in("status", ["pending", "needs_info"])
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">إيصالات التحويل</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">الإعلان</th>
              <th className="text-right px-4 py-3">المعلن</th>
              <th className="text-right px-4 py-3">المبلغ</th>
              <th className="text-right px-4 py-3">الإيصال</th>
              <th className="text-right px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(payments as unknown as (CommissionPayment & {
              commission_obligations: { amount: number; ad_reference_text?: string; ads?: { title: string }; profiles: { display_name: string } };
            })[])?.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  {p.commission_obligations?.ads?.title ?? (
                    <span className="text-amber-600">{p.commission_obligations?.ad_reference_text ?? "إعلان قديم"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{p.commission_obligations?.profiles?.display_name}</td>
                <td className="px-4 py-3">{formatNumber(Number(p.commission_obligations?.amount))} ر.س</td>
                <td className="px-4 py-3">
                  {p.receipt_url && <a href={p.receipt_url} target="_blank" className="text-[#6D28D9] hover:underline">عرض الإيصال</a>}
                </td>
                <td className="px-4 py-3"><AdminCommissionActions paymentId={p.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!payments || payments.length === 0) && <p className="text-center text-sm text-gray-400 py-10">لا توجد إيصالات بانتظار المراجعة.</p>}
      </div>
    </div>
  );
}

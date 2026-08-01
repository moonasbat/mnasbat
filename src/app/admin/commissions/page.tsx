import { createAdminClient } from "@/lib/supabase/admin";
import AdminCommissionActions from "@/components/admin/AdminCommissionActions";
import { CommissionObligation, CommissionPayment } from "@/lib/types";
import { formatGregorianDate, formatNumber } from "@/lib/formatTime";
import { Download, Receipt, ScrollText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import Badge from "@/components/admin/Badge";
import Pagination from "@/components/admin/Pagination";
import Link from "next/link";

const OBLIGATION_STATUS_LABELS: Record<string, string> = {
  due: "مستحق",
  receipt_submitted: "إيصال مُرسل",
  in_review: "قيد المراجعة",
  approved: "مدفوع",
  rejected: "مرفوض",
};

const OBLIGATION_STATUS_COLOR: Record<string, "amber" | "blue" | "green" | "red"> = {
  due: "amber",
  receipt_submitted: "blue",
  in_review: "blue",
  approved: "green",
  rejected: "red",
};

const PAGE_SIZE = 30;

export default async function AdminCommissionsPage({ searchParams }: { searchParams: Promise<{ view?: string; page?: string }> }) {
  const { view: viewParam, page: pageParam } = await searchParams;
  const view = viewParam === "ledger" ? "ledger" : "pending";
  const admin = createAdminClient();

  if (view === "ledger") {
    const page = Math.max(1, Number(pageParam) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [{ data: rows }, { data: dueRows }, { data: approvedThisMonth }, { data: approvedAll }] = await Promise.all([
      admin.from("commission_obligations").select("*, ads(title), profiles(display_name)").order("created_at", { ascending: false }).range(from, to + 1),
      admin.from("commission_obligations").select("amount").eq("status", "due"),
      admin.from("commission_obligations").select("amount").eq("status", "approved").gte("updated_at", monthStart),
      admin.from("commission_obligations").select("amount").eq("status", "approved"),
    ]);

    const obligations = (rows ?? []).slice(0, PAGE_SIZE) as (CommissionObligation & { ads: { title: string } | null; profiles: { display_name: string } | null })[];
    const hasMore = (rows?.length ?? 0) > PAGE_SIZE;
    const totalDue = (dueRows ?? []).reduce((s, o) => s + Number(o.amount), 0);
    const totalThisMonth = (approvedThisMonth ?? []).reduce((s, o) => s + Number(o.amount), 0);
    const totalAllTime = (approvedAll ?? []).reduce((s, o) => s + Number(o.amount), 0);

    return (
      <div className="space-y-4">
        <PageHeader title="العمولات" subtitle="سجل كامل بكل الالتزامات المالية بغض النظر عن حالتها." />
        <CommissionTabs active="ledger" />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400">مستحق حالياً</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{formatNumber(totalDue)} ر.س</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400">محصّل هذا الشهر</p>
            <p className="text-xl font-bold text-green-600 mt-1">{formatNumber(totalThisMonth)} ر.س</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400">إجمالي محصّل منذ البداية</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatNumber(totalAllTime)} ر.س</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {obligations.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الإعلان</th>
                  <th className="text-right px-4 py-3 font-medium">المعلن</th>
                  <th className="text-right px-4 py-3 font-medium">المبلغ</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {obligations.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">{o.ads?.title ?? o.ad_reference_text ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/users/${o.user_id}`} className="hover:underline">{o.profiles?.display_name}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatNumber(o.amount)} ر.س</td>
                    <td className="px-4 py-3"><Badge color={OBLIGATION_STATUS_COLOR[o.status] ?? "gray"}>{OBLIGATION_STATUS_LABELS[o.status]}</Badge></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatGregorianDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={ScrollText} title="ما فيه التزامات عمولة مسجّلة بعد" />
          )}
          <Pagination page={page} hasMore={hasMore} basePath="/admin/commissions" extraParams={{ view: "ledger" }} />
        </div>
      </div>
    );
  }

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

      <CommissionTabs active="pending" />

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

function CommissionTabs({ active }: { active: "pending" | "ledger" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/admin/commissions"
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${active === "pending" ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
      >
        إيصالات بانتظار المراجعة
      </a>
      <a
        href="/admin/commissions?view=ledger"
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${active === "ledger" ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
      >
        سجل كل الالتزامات
      </a>
    </div>
  );
}

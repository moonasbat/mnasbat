import { createClient } from "@/lib/supabase/server";
import { CommissionObligation, Ad, AdminSettings } from "@/lib/types";
import { COMMISSION_CONTENT } from "@/lib/content";
import ReportDealForm from "@/components/dashboard/ReportDealForm";
import ReceiptUploadForm from "@/components/dashboard/ReceiptUploadForm";

const STATUS_LABELS: Record<string, string> = {
  due: "مستحقة",
  receipt_submitted: "إيصال مرفوع",
  in_review: "قيد المراجعة",
  approved: "معتمدة ومدفوعة",
  rejected: "مرفوضة",
};

export default async function CommissionPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const { ad: preselectedAdId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: obligations }, { data: myAds }, { data: settingsRows }] = await Promise.all([
    supabase.from("commission_obligations").select("*, ads(*)").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("ads").select("*").eq("user_id", user!.id).in("status", ["published", "paused", "expired"]),
    supabase.from("admin_settings").select("key,value"),
  ]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  const due = (obligations ?? []).filter((o) => o.status === "due");
  const inReview = (obligations ?? []).filter((o) => ["receipt_submitted", "in_review"].includes(o.status));
  const paid = (obligations ?? []).filter((o) => o.status === "approved");

  const bankReady = settings.bank_active === "true" && settings.bank_iban;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{COMMISSION_CONTENT.pageTitle}</h1>
        <p className="text-sm text-gray-500">{COMMISSION_CONTENT.intro}</p>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-xs font-medium text-[#6D28D9] mb-3">كيف تعمل العمولة؟</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
          <div className="bg-white rounded-xl p-3">
            <span className="block text-[#6D28D9] font-bold mb-1">1</span>
            سجّل الصفقة من إعلاناتك بعد إتمامها
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="block text-[#6D28D9] font-bold mb-1">2</span>
            حوّل المبلغ لحساب مناسبات البنكي
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="block text-[#6D28D9] font-bold mb-1">3</span>
            ارفع إيصال التحويل هنا
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="block text-[#6D28D9] font-bold mb-1">4</span>
            الإدارة تعتمد الدفع وتمنحك المزايا
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">{COMMISSION_CONTENT.due}</p>
          <p className="text-lg font-bold text-amber-600 mt-1">{due.reduce((s, o) => s + Number(o.amount), 0).toLocaleString("ar-SA")} ر.س</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">{COMMISSION_CONTENT.inReview}</p>
          <p className="text-lg font-bold text-blue-600 mt-1">{inReview.reduce((s, o) => s + Number(o.amount), 0).toLocaleString("ar-SA")} ر.س</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">{COMMISSION_CONTENT.paid}</p>
          <p className="text-lg font-bold text-green-600 mt-1">{paid.reduce((s, o) => s + Number(o.amount), 0).toLocaleString("ar-SA")} ر.س</p>
        </div>
      </div>

      {myAds && myAds.length > 0 && <ReportDealForm ads={myAds as Ad[]} preselectedAdId={preselectedAdId} />}

      <div className="space-y-3">
        {(obligations ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">لا توجد التزامات عمولة حالياً.</p>
        ) : (
          (obligations as CommissionObligation[]).map((o) => (
            <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">{o.ads?.title ?? COMMISSION_CONTENT.adNumber}</p>
                <span className="text-xs bg-gray-100 rounded-lg px-2 py-1">{STATUS_LABELS[o.status]}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                <span>{COMMISSION_CONTENT.dealValue}: {o.deal_value?.toLocaleString("ar-SA") ?? "-"} ر.س</span>
                <span>{COMMISSION_CONTENT.rate}: {o.rate}%</span>
                <span>{COMMISSION_CONTENT.amount}: {Number(o.amount).toLocaleString("ar-SA")} ر.س</span>
              </div>

              {o.status === "due" && !bankReady && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                  الدفع غير متاح مؤقتاً — لم تُفعّل الإدارة بيانات الحساب البنكي بعد. سنشعرك فور توفر الدفع.
                </p>
              )}

              {o.status === "due" && bankReady && (
                <div className="mt-3 bg-purple-50 rounded-xl p-3 text-xs text-gray-700 space-y-1">
                  <p>{COMMISSION_CONTENT.paymentPageIntro}</p>
                  <p><strong>{COMMISSION_CONTENT.bank}:</strong> {settings.bank_name}</p>
                  <p><strong>{COMMISSION_CONTENT.accountName}:</strong> {settings.bank_account_name}</p>
                  <p><strong>{COMMISSION_CONTENT.iban}:</strong> {settings.bank_iban}</p>
                  <p><strong>{COMMISSION_CONTENT.amountDue}:</strong> {Number(o.amount).toLocaleString("ar-SA")} ر.س</p>
                  <p>{COMMISSION_CONTENT.transferReason(o.ad_id.slice(0, 8))}</p>
                  <div className="pt-2">
                    <ReceiptUploadForm obligationId={o.id} />
                  </div>
                </div>
              )}

              {o.status === "receipt_submitted" && (
                <p className="text-xs text-blue-600 mt-2">{COMMISSION_CONTENT.receiptSubmitted}</p>
              )}
              {o.status === "approved" && (
                <p className="text-xs text-green-600 mt-2">{COMMISSION_CONTENT.receiptApproved}</p>
              )}
              {o.status === "rejected" && (
                <div className="mt-2">
                  <p className="text-xs text-red-600">{COMMISSION_CONTENT.receiptRejected}</p>
                  <p className="text-xs text-gray-400">{COMMISSION_CONTENT.reuploadAllowed}</p>
                  <ReceiptUploadForm obligationId={o.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

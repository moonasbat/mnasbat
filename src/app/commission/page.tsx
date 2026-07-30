import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CommissionRequestForm from "@/components/CommissionRequestForm";
import { Ad, AdminSettings, CommissionObligation, Profile } from "@/lib/types";
import { formatGregorianDate } from "@/lib/formatTime";

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

  const [{ data: profile }, { data: settingsRows }, { data: myAds }, { data: obligations }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("admin_settings").select("key,value"),
    user ? supabase.from("ads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    user
      ? supabase.from("commission_obligations").select("*, ads(title)").eq("user_id", user.id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));
  const rate = Number(settings.commission_rate ?? 5);
  const bankReady = settings.bank_active === "true" && settings.bank_iban;
  const exemptUntil = settings.commission_exempt_until ? new Date(settings.commission_exempt_until) : null;
  const isExempt = exemptUntil && exemptUntil.getTime() > Date.now();

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">العمولة</h1>
          {isExempt ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              🎉 المنصة تُعفي جميع المستخدمين من العمولة حتى {formatGregorianDate(exemptUntil!)}. لا حاجة لتسجيل أي صفقات خلال هذه الفترة.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              نسبة العمولة الحالية <span className="font-bold text-[#6D28D9]">{rate}%</span> من قيمة أي صفقة تمت بسبب إعلانك على مناسبات،
              سواء تمت داخل المنصة أو خارجها. سجّل الصفقة وارفع إيصال التحويل من النموذج أدناه.
            </p>
          )}
        </div>

        {bankReady ? (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-gray-700 space-y-1">
            <p className="font-medium text-[#6D28D9] mb-2">بيانات التحويل</p>
            <p><strong>البنك:</strong> {settings.bank_name}</p>
            <p><strong>اسم صاحب الحساب:</strong> {settings.bank_account_name}</p>
            <p><strong>رقم الآيبان IBAN:</strong> {settings.bank_iban}</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
            الدفع غير متاح مؤقتاً — لم تُفعَّل الإدارة بيانات الحساب البنكي بعد.
          </div>
        )}

        <CommissionRequestForm ads={(myAds as Ad[]) ?? []} rate={rate} isLoggedIn={!!user} preselectedAdId={preselectedAdId} />

        {user && obligations && obligations.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-900 mb-3">عمولاتي</h2>
            <div className="space-y-2">
              {(obligations as (CommissionObligation & { ads?: { title: string } })[]).map((o) => (
                <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.ads?.title ?? o.ad_reference_text ?? "إعلان قديم"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Number(o.amount).toLocaleString("ar-SA")} ر.س · {formatGregorianDate(o.created_at)}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 rounded-lg px-2 py-1 shrink-0">{STATUS_LABELS[o.status]}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

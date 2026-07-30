import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Megaphone, DollarSign, Flag, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/formatTime";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [
    { count: usersTotal },
    { count: usersToday },
    { count: adsPublished },
    { count: adsPending },
    { count: reportsOpen },
    { data: obligationsDue },
    { count: receiptsPending },
    { data: bankRow },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    admin.from("ads").select("id", { count: "exact", head: true }).eq("status", "published"),
    admin.from("ads").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("commission_obligations").select("amount").eq("status", "due"),
    admin.from("commission_payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("admin_settings").select("value").eq("key", "bank_active").maybeSingle(),
  ]);

  const bankActive = bankRow?.value === "true";

  const totalDue = (obligationsDue ?? []).reduce((s, o) => s + Number(o.amount), 0);

  const stats = [
    { label: "إجمالي المستخدمين", value: usersTotal ?? 0, sub: `${usersToday ?? 0} اليوم`, icon: Users, color: "bg-purple-50", iconColor: "text-[#6D28D9]" },
    { label: "إعلانات منشورة", value: adsPublished ?? 0, sub: `${adsPending ?? 0} قيد المراجعة`, icon: Megaphone, color: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "عمولات مستحقة", value: `${formatNumber(totalDue)} ر.س`, sub: `${receiptsPending ?? 0} إيصال قيد المراجعة`, icon: DollarSign, color: "bg-green-50", iconColor: "text-green-600" },
    { label: "بلاغات مفتوحة", value: reportsOpen ?? 0, sub: "تحتاج مراجعة", icon: Flag, color: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>

      {!bankActive && (
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle size={18} className="shrink-0" />
          الحساب البنكي غير مفعّل بعد — المستخدمون لن يستطيعوا دفع العمولة حتى تدخل بيانات البنك وتفعّله من الإعدادات.
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border border-gray-100 p-5 ${s.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white ${s.iconColor}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

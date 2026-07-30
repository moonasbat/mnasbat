"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings, FeatureFlags } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";

// إعدادات نصية/رقمية مجمّعة بأقسام مفهومة لمالك غير تقني
const SETTINGS_GROUPS: { title: string; fields: [string, string, string][] }[] = [
  {
    title: "العمولة",
    fields: [
      ["commission_rate", "نسبة العمولة", "النسبة % التي تُحسب من قيمة كل صفقة يُبلَّغ عنها"],
      ["commission_min", "الحد الأدنى للعمولة", "أقل مبلغ عمولة يُطلب من المعلن (اتركه 0 لعدم وجود حد أدنى)"],
      ["commission_max", "الحد الأقصى للعمولة", "أعلى مبلغ عمولة يُطلب من المعلن (اتركه 0 لعدم وجود حد أقصى)"],
      ["commission_exempt_until", "إعفاء مؤقت حتى تاريخ (YYYY-MM-DD)", "أثناء الإعفاء يظهر للمستخدمين أنهم معفون من العمولة حتى هذا التاريخ. اتركه فارغاً لعدم وجود إعفاء"],
    ],
  },
  {
    title: "الحساب البنكي لاستقبال العمولات",
    fields: [
      ["bank_name", "اسم البنك", "يظهر للمستخدم في صفحة دفع العمولة"],
      ["bank_account_name", "اسم صاحب الحساب", "يظهر للمستخدم عند التحويل"],
      ["bank_iban", "رقم الآيبان IBAN", "الرقم الذي يحوّل عليه المستخدمون العمولة"],
    ],
  },
  {
    title: "الإعلانات",
    fields: [
      ["max_images_per_ad", "الحد الأقصى للصور", "عدد الصور المسموح لكل إعلان (لا يزيد عن 10 حسب سياسة المنصة)"],
      ["ad_duration_days", "مدة نشر الإعلان (يوماً)", "بعد هذه المدة يتحول الإعلان إلى «منتهٍ» تلقائياً"],
    ],
  },
  {
    title: "حدود الاستخدام (لمنع الإساءة)",
    fields: [
      ["rate_limit_ads_per_day", "إعلانات لكل مستخدم/يوم", ""],
      ["rate_limit_messages_per_hour", "رسائل لكل مستخدم/ساعة", ""],
      ["rate_limit_comments_per_hour", "تعليقات لكل مستخدم/ساعة", ""],
      ["rate_limit_reports_per_day", "بلاغات لكل مستخدم/يوم", ""],
    ],
  },
];

const FLAG_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "تسجيل الدخول",
    keys: ["google_login_enabled", "phone_login_enabled", "email_login_enabled"],
  },
  {
    title: "التواصل والتفاعل",
    keys: ["comments_enabled", "messages_enabled", "whatsapp_enabled", "favorites_enabled", "reviews_enabled"],
  },
  {
    title: "الإعلانات والمزايا",
    keys: ["manual_review_enabled", "featured_ads_enabled", "commission_perks_enabled", "ad_renewal_enabled", "watermark_enabled"],
  },
  {
    title: "أخرى",
    keys: ["verification_enabled", "city_filter_enabled", "view_stats_enabled", "saved_search_enabled"],
  },
];

const FLAG_DESCRIPTIONS: Record<string, string> = {
  google_login_enabled: "السماح بتسجيل الدخول عبر حساب Google",
  phone_login_enabled: "السماح بتسجيل الدخول برقم الجوال (يحتاج إعداد OTP لاحقاً)",
  email_login_enabled: "السماح بتسجيل الدخول بالبريد وكلمة مرور",
  comments_enabled: "إظهار قسم التعليقات تحت كل إعلان",
  messages_enabled: "السماح بإرسال رسائل داخلية بين المستخدمين",
  whatsapp_enabled: "إظهار زر التواصل عبر واتساب في صفحة الإعلان",
  favorites_enabled: "السماح بإضافة الإعلانات للمفضلة",
  reviews_enabled: "السماح بتقييم مقدمي الخدمات",
  manual_review_enabled: "كل إعلان جديد ينتظر موافقتك قبل ما يظهر للعامة (موصى به). إيقافه يعني نشر الإعلانات فوراً بدون مراجعة",
  featured_ads_enabled: "تفعيل قسم «الإعلانات المميزة» في الصفحة الرئيسية",
  commission_perks_enabled: "منح مزايا (شارة، أولوية ظهور) للمستخدمين بعد اعتماد دفع العمولة",
  ad_renewal_enabled: "السماح للمستخدم بتجديد إعلانه بعد انتهائه",
  watermark_enabled: "طبع شعار مناسبات تلقائياً على كل صورة إعلان تُرفع",
  verification_enabled: "تفعيل نظام توثيق الحسابات (شارة موثّق)",
  city_filter_enabled: "إظهار فلتر المدينة في صفحة البحث",
  view_stats_enabled: "عرض عدد المشاهدات على الإعلانات للمعلنين",
  saved_search_enabled: "السماح بحفظ عمليات البحث والتنبيه عليها (ميزة قيد التطوير)",
};

export default function AdminSettingsForm({
  settings,
  flags,
  flagLabels,
}: {
  settings: AdminSettings;
  flags: FeatureFlags;
  flagLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [flagValues, setFlagValues] = useState(flags);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  async function saveSetting(key: string, overrideValue?: string) {
    const value = overrideValue ?? values[key];
    setSaving(key);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
    router.refresh();
  }

  async function toggleBankActive() {
    const newValue = values.bank_active === "true" ? "false" : "true";
    setValues((v) => ({ ...v, bank_active: newValue }));
    await saveSetting("bank_active", newValue);
  }

  async function toggleFlag(key: string) {
    const newValue = !flagValues[key];
    setFlagValues((f) => ({ ...f, [key]: newValue }));
    await fetch("/api/admin/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, enabled: newValue }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title} className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map(([key, label, desc]) => (
              <div key={key} className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-800 block">{label}</label>
                  {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                  <input
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={() => saveSetting(key)}
                  disabled={saving === key}
                  className="mt-6 bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-xs font-medium disabled:opacity-60 shrink-0"
                >
                  {savedKey === key ? "تم الحفظ ✓" : "حفظ"}
                </button>
              </div>
            ))}
            {group.title === "الحساب البنكي لاستقبال العمولات" && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">تفعيل استقبال العمولات</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    عند الإيقاف، لن تظهر بيانات الحساب البنكي للمستخدمين ولن يتمكنوا من رفع إيصالات جديدة
                  </p>
                </div>
                <ToggleSwitch checked={values.bank_active === "true"} onChange={toggleBankActive} />
              </div>
            )}
          </div>
        </div>
      ))}

      {FLAG_GROUPS.map((group) => (
        <div key={group.title} className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">{group.title}</h2>
          <div className="divide-y divide-gray-50">
            {group.keys
              .filter((k) => k in flagValues)
              .map((key) => (
                <div key={key} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{flagLabels[key] ?? key}</p>
                    {FLAG_DESCRIPTIONS[key] && <p className="text-xs text-gray-400 mt-0.5">{FLAG_DESCRIPTIONS[key]}</p>}
                  </div>
                  <ToggleSwitch checked={flagValues[key]} onChange={() => toggleFlag(key)} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

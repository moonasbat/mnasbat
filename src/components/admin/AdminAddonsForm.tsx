"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings } from "@/lib/types";
import { CheckCircle2, Circle, BarChart3, Search, Share2, Music2, Tags, Ghost, Activity, ShieldCheck } from "lucide-react";

type Addon = {
  key: string;
  title: string;
  icon: React.ElementType;
  label: string;
  placeholder: string;
  help: string;
  helpUrl: string;
  validate: (value: string) => boolean;
  extra?: { key: string; label: string; placeholder: string; validate: (value: string) => boolean };
};

const CONNECT_ADDONS: Addon[] = [
  {
    key: "ga4_measurement_id",
    title: "Google Analytics",
    icon: BarChart3,
    label: "معرف القياس (Measurement ID)",
    placeholder: "G-XXXXXXXXXX",
    help: "أنشئ خاصية GA4 من حسابك في Google Analytics وانسخ المعرف من إعدادات جمع البيانات",
    helpUrl: "https://analytics.google.com",
    validate: (v) => /^G-[A-Z0-9]{6,12}$/i.test(v.trim()),
  },
  {
    key: "google_site_verification",
    title: "Google Search Console",
    icon: Search,
    label: "رمز تحقق الملكية",
    placeholder: "مثال: AbCdEfGhIjKlMnOpQrStUvWxYz",
    help: "من Search Console اختر طريقة التحقق «وسم HTML» وانسخ القيمة داخل content= فقط (بدون بقية الوسم)",
    helpUrl: "https://search.google.com/search-console",
    validate: (v) => /^[A-Za-z0-9_-]{20,80}$/.test(v.trim()),
  },
  {
    key: "gtm_container_id",
    title: "Google Tag Manager",
    icon: Tags,
    label: "معرف الحاوية (Container ID)",
    placeholder: "GTM-XXXXXXX",
    help: "يديك تحكم كامل بكل أكواد التتبع من مكان واحد بدون تعديل الموقع كل مرة",
    helpUrl: "https://tagmanager.google.com",
    validate: (v) => /^GTM-[A-Z0-9]{4,10}$/i.test(v.trim()),
  },
  {
    key: "facebook_pixel_id",
    title: "Facebook Pixel",
    icon: Share2,
    label: "معرف البكسل",
    placeholder: "مثال: 123456789012345",
    help: "من Meta Events Manager، انسخ معرف البكسل الرقمي",
    helpUrl: "https://business.facebook.com/events_manager",
    validate: (v) => /^\d{10,20}$/.test(v.trim()),
  },
  {
    key: "tiktok_pixel_id",
    title: "TikTok Pixel",
    icon: Music2,
    label: "معرف البكسل",
    placeholder: "مثال: CXXXXXXXXXXXXXXXXXXX",
    help: "من TikTok Ads Manager ← Assets ← Events، انسخ معرف البكسل",
    helpUrl: "https://ads.tiktok.com",
    validate: (v) => /^[A-Z0-9]{15,25}$/i.test(v.trim()),
  },
  {
    key: "snapchat_pixel_id",
    title: "Snapchat Pixel",
    icon: Ghost,
    label: "معرف البكسل",
    placeholder: "مثال: a1b2c3d4-...",
    help: "من Snapchat Ads Manager ← Events Manager، انسخ معرف البكسل — مجاني للإضافة، يُستخدم لاستهداف وقياس إعلانات سناب شات",
    helpUrl: "https://ads.snapchat.com",
    validate: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim()),
  },
  {
    key: "clarity_project_id",
    title: "Microsoft Clarity",
    icon: Activity,
    label: "معرف المشروع (Project ID)",
    placeholder: "مثال: abc123defg",
    help: "خرائط حرارية وتسجيل جلسات الزوار — مجاني بالكامل، انسخ المعرف من إعدادات المشروع",
    helpUrl: "https://clarity.microsoft.com",
    validate: (v) => /^[a-z0-9]{8,16}$/i.test(v.trim()),
  },
  {
    key: "recaptcha_site_key",
    title: "Google reCAPTCHA",
    icon: ShieldCheck,
    label: "مفتاح الموقع (Site Key)",
    placeholder: "6Lc...",
    help: "حماية نموذج «تواصل معنا» من الروبوتات والسبام تلقائياً — أنشئ مفتاح reCAPTCHA v3 وانسخ المفتاحين",
    helpUrl: "https://www.google.com/recaptcha/admin",
    validate: (v) => /^6L[A-Za-z0-9_-]{35,45}$/.test(v.trim()),
    extra: {
      key: "recaptcha_secret_key",
      label: "المفتاح السري (Secret Key)",
      placeholder: "6Lc...",
      validate: (v) => /^6L[A-Za-z0-9_-]{35,45}$/.test(v.trim()),
    },
  },
];

export default function AdminAddonsForm({ settings }: { settings: AdminSettings }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const lastSavedRef = useRef<Record<string, string>>(settings);

  async function save(key: string) {
    const value = values[key] ?? "";
    if (lastSavedRef.current[key] === value) return;
    setSaving(key);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    lastSavedRef.current[key] = value;
    setSaving(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {CONNECT_ADDONS.map((i) => {
        const rawValue = lastSavedRef.current[i.key]?.trim() ?? "";
        const connected = !!rawValue && i.validate(rawValue);
        const invalid = !!rawValue && !i.validate(rawValue);
        const extraRawValue = i.extra ? lastSavedRef.current[i.extra.key]?.trim() ?? "" : "";
        const extraInvalid = !!i.extra && !!extraRawValue && !i.extra.validate(extraRawValue);
        const Icon = i.icon;
        return (
          <div key={i.key} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#6D28D9] shrink-0">
                  <Icon size={16} />
                </div>
                <h3 className="font-bold text-gray-900">{i.title}</h3>
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${connected ? "text-green-600" : invalid ? "text-red-600" : "text-gray-400"}`}>
                {connected ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                {connected ? "متصل" : invalid ? "كود غير صحيح" : "غير متصل"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {i.help} —{" "}
              <a href={i.helpUrl} target="_blank" rel="noopener noreferrer" className="text-[#6D28D9] hover:underline">
                فتح {i.title}
              </a>
            </p>
            <label className="text-sm font-medium text-gray-700 block mb-1">{i.label}</label>
            <input
              value={values[i.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}
              onBlur={() => save(i.key)}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              placeholder={i.placeholder}
              dir="ltr"
              className={`w-full border rounded-xl px-3 py-2 text-sm ${invalid ? "border-red-300" : "border-gray-200"}`}
            />
            {invalid && <p className="text-[11px] text-red-600 mt-1">الصيغة غير صحيحة — تأكد إنك نسخت الكود الصحيح بدون مسافات إضافية.</p>}
            {i.extra && (
              <>
                <label className="text-sm font-medium text-gray-700 block mb-1 mt-2">{i.extra.label}</label>
                <input
                  value={values[i.extra.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [i.extra!.key]: e.target.value }))}
                  onBlur={() => save(i.extra!.key)}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  placeholder={i.extra.placeholder}
                  dir="ltr"
                  className={`w-full border rounded-xl px-3 py-2 text-sm ${extraInvalid ? "border-red-300" : "border-gray-200"}`}
                />
                {extraInvalid && <p className="text-[11px] text-red-600 mt-1">الصيغة غير صحيحة — تأكد إنك نسخت المفتاح السري الصحيح.</p>}
              </>
            )}
            <p className="text-[11px] mt-1.5 h-4">
              {(saving === i.key || saving === i.extra?.key) && <span className="text-gray-400">جارٍ الحفظ…</span>}
              {(savedKey === i.key || savedKey === i.extra?.key) && <span className="text-green-600">تم الحفظ ✓</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

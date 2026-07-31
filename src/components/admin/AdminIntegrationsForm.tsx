"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings } from "@/lib/types";
import { CheckCircle2, Circle } from "lucide-react";

const INTEGRATIONS: { key: string; title: string; label: string; placeholder: string; help: string; helpUrl: string }[] = [
  {
    key: "ga4_measurement_id",
    title: "Google Analytics",
    label: "معرف القياس (Measurement ID)",
    placeholder: "G-XXXXXXXXXX",
    help: "أنشئ خاصية GA4 من حسابك في Google Analytics وانسخ المعرف من إعدادات جمع البيانات",
    helpUrl: "https://analytics.google.com",
  },
  {
    key: "google_site_verification",
    title: "Google Search Console",
    label: "رمز تحقق الملكية",
    placeholder: "مثال: AbCdEfGhIjKlMnOpQrStUvWxYz",
    help: "من Search Console اختر طريقة التحقق «وسم HTML» وانسخ القيمة داخل content= فقط (بدون بقية الوسم)",
    helpUrl: "https://search.google.com/search-console",
  },
  {
    key: "facebook_pixel_id",
    title: "Facebook Pixel",
    label: "معرف البكسل",
    placeholder: "مثال: 123456789012345",
    help: "من Meta Events Manager، انسخ معرف البكسل الرقمي",
    helpUrl: "https://business.facebook.com/events_manager",
  },
  {
    key: "tiktok_pixel_id",
    title: "TikTok Pixel",
    label: "معرف البكسل",
    placeholder: "مثال: CXXXXXXXXXXXXXXXXXXX",
    help: "من TikTok Ads Manager ← Assets ← Events، انسخ معرف البكسل",
    helpUrl: "https://ads.tiktok.com",
  },
];

export default function AdminIntegrationsForm({ settings }: { settings: AdminSettings }) {
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
      {INTEGRATIONS.map((i) => {
        const connected = !!lastSavedRef.current[i.key]?.trim();
        return (
          <div key={i.key} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900">{i.title}</h2>
              <span className={`flex items-center gap-1 text-xs font-medium ${connected ? "text-green-600" : "text-gray-400"}`}>
                {connected ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                {connected ? "متصل" : "غير متصل"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {i.help} —{" "}
              <a href={i.helpUrl} target="_blank" rel="noopener noreferrer" className="text-[#6D28D9] hover:underline">
                فتح {i.title}
              </a>
            </p>
            <label className="text-sm font-medium text-gray-700 block mb-1">{i.label}</label>
            <div className="flex items-center gap-2">
              <input
                value={values[i.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}
                onBlur={() => save(i.key)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                placeholder={i.placeholder}
                dir="ltr"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <p className="text-[11px] mt-1.5 h-4">
              {saving === i.key && <span className="text-gray-400">جارٍ الحفظ…</span>}
              {savedKey === i.key && <span className="text-green-600">تم الحفظ ✓</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

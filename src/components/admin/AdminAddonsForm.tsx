"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings, FeatureFlags } from "@/lib/types";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { CheckCircle2, Circle, BarChart3, Search, Share2, Music2, Megaphone, MessageCircle } from "lucide-react";

const CONNECT_ADDONS: { key: string; title: string; icon: React.ElementType; label: string; placeholder: string; help: string; helpUrl: string }[] = [
  {
    key: "ga4_measurement_id",
    title: "Google Analytics",
    icon: BarChart3,
    label: "معرف القياس (Measurement ID)",
    placeholder: "G-XXXXXXXXXX",
    help: "أنشئ خاصية GA4 من حسابك في Google Analytics وانسخ المعرف من إعدادات جمع البيانات",
    helpUrl: "https://analytics.google.com",
  },
  {
    key: "google_site_verification",
    title: "Google Search Console",
    icon: Search,
    label: "رمز تحقق الملكية",
    placeholder: "مثال: AbCdEfGhIjKlMnOpQrStUvWxYz",
    help: "من Search Console اختر طريقة التحقق «وسم HTML» وانسخ القيمة داخل content= فقط (بدون بقية الوسم)",
    helpUrl: "https://search.google.com/search-console",
  },
  {
    key: "facebook_pixel_id",
    title: "Facebook Pixel",
    icon: Share2,
    label: "معرف البكسل",
    placeholder: "مثال: 123456789012345",
    help: "من Meta Events Manager، انسخ معرف البكسل الرقمي",
    helpUrl: "https://business.facebook.com/events_manager",
  },
  {
    key: "tiktok_pixel_id",
    title: "TikTok Pixel",
    icon: Music2,
    label: "معرف البكسل",
    placeholder: "مثال: CXXXXXXXXXXXXXXXXXXX",
    help: "من TikTok Ads Manager ← Assets ← Events، انسخ معرف البكسل",
    helpUrl: "https://ads.tiktok.com",
  },
];

export default function AdminAddonsForm({ settings, flags }: { settings: AdminSettings; flags: FeatureFlags }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [flagState, setFlagState] = useState(flags);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const lastSavedRef = useRef<Record<string, string>>(settings);

  async function saveSetting(key: string) {
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

  async function toggleFlag(key: string) {
    const next = !flagState[key];
    setFlagState((f) => ({ ...f, [key]: next }));
    await fetch("/api/admin/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, enabled: next }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">تحليلات وتسويق</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CONNECT_ADDONS.map((i) => {
            const connected = !!lastSavedRef.current[i.key]?.trim();
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
                <input
                  value={values[i.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}
                  onBlur={() => saveSetting(i.key)}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  placeholder={i.placeholder}
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
                <p className="text-[11px] mt-1.5 h-4">
                  {saving === i.key && <span className="text-gray-400">جارٍ الحفظ…</span>}
                  {savedKey === i.key && <span className="text-green-600">تم الحفظ ✓</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">أدوات الموقع</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#6D28D9] shrink-0">
                  <Megaphone size={16} />
                </div>
                <h3 className="font-bold text-gray-900">شريط إعلان أعلى الموقع</h3>
              </div>
              <ToggleSwitch checked={!!flagState.announcement_bar_enabled} onChange={() => toggleFlag("announcement_bar_enabled")} />
            </div>
            <p className="text-xs text-gray-400 mb-3">يظهر شريط بنفسجي أعلى كل صفحات الموقع لعرض تنبيه أو عرض خاص، ويقدر الزائر يغلقه.</p>
            <label className="text-sm font-medium text-gray-700 block mb-1">نص الشريط</label>
            <input
              value={values.announcement_text ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, announcement_text: e.target.value }))}
              onBlur={() => saveSetting("announcement_text")}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              placeholder="مثال: عمولة مخفّضة هذا الأسبوع فقط!"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2"
            />
            <label className="text-sm font-medium text-gray-700 block mb-1">رابط عند الضغط (اختياري)</label>
            <input
              value={values.announcement_link ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, announcement_link: e.target.value }))}
              onBlur={() => saveSetting("announcement_link")}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              placeholder="/pages/commission-policy"
              dir="ltr"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <p className="text-[11px] mt-1.5 h-4">
              {saving === "announcement_text" || saving === "announcement_link" ? <span className="text-gray-400">جارٍ الحفظ…</span> : null}
              {savedKey === "announcement_text" || savedKey === "announcement_link" ? <span className="text-green-600">تم الحفظ ✓</span> : null}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#6D28D9] shrink-0">
                  <MessageCircle size={16} />
                </div>
                <h3 className="font-bold text-gray-900">زر واتساب عائم</h3>
              </div>
              <ToggleSwitch checked={!!flagState.floating_whatsapp_enabled} onChange={() => toggleFlag("floating_whatsapp_enabled")} />
            </div>
            <p className="text-xs text-gray-400 mb-3">زر عائم يظهر في كل صفحات الموقع للتواصل السريع مع الدعم عبر واتساب.</p>
            <label className="text-sm font-medium text-gray-700 block mb-1">رقم واتساب الدعم</label>
            <input
              value={values.whatsapp_support_number ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, whatsapp_support_number: e.target.value }))}
              onBlur={() => saveSetting("whatsapp_support_number")}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              placeholder="+9665xxxxxxxx"
              dir="ltr"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <p className="text-[11px] mt-1.5 h-4">
              {saving === "whatsapp_support_number" && <span className="text-gray-400">جارٍ الحفظ…</span>}
              {savedKey === "whatsapp_support_number" && <span className="text-green-600">تم الحفظ ✓</span>}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

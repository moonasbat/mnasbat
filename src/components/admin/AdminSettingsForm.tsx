"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings, FeatureFlags } from "@/lib/types";

const SETTINGS_LABELS: [string, string][] = [
  ["commission_rate", "نسبة العمولة الأساسية %"],
  ["max_images_per_ad", "الحد الأقصى للصور لكل إعلان"],
  ["ad_duration_days", "مدة نشر الإعلان (يوماً)"],
  ["bank_name", "اسم البنك"],
  ["bank_account_name", "اسم صاحب الحساب"],
  ["bank_iban", "رقم الآيبان IBAN"],
  ["bank_active", "حالة الحساب البنكي (true/false)"],
];

export default function AdminSettingsForm({ settings, flags }: { settings: AdminSettings; flags: FeatureFlags }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [flagValues, setFlagValues] = useState(flags);
  const [saving, setSaving] = useState<string | null>(null);

  async function saveSetting(key: string) {
    setSaving(key);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] }),
    });
    setSaving(null);
    router.refresh();
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
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-gray-900">إعدادات المنصة</h2>
        {SETTINGS_LABELS.map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-56 shrink-0">{label}</label>
            <input
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <button onClick={() => saveSetting(key)} disabled={saving === key} className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-xs font-medium disabled:opacity-60">
              حفظ
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
        <h2 className="font-bold text-gray-900 mb-2">المزايا (Feature Flags)</h2>
        {Object.entries(flagValues).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{key}</span>
            <button
              onClick={() => toggleFlag(key)}
              className={`text-xs px-3 py-1 rounded-full font-medium ${enabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}
            >
              {enabled ? "مفعّل" : "موقف"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

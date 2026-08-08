"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSettings, FeatureFlags } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";
import { SETTINGS_GROUPS, FLAG_GROUPS, FLAG_DESCRIPTIONS, ADMIN_SETTINGS_TABS } from "@/lib/adminSettingsMeta";

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
  const [activeTab, setActiveTab] = useState(ADMIN_SETTINGS_TABS[0].id);

  const lastSavedRef = useRef<Record<string, string>>(settings);

  async function saveSetting(key: string, overrideValue?: string) {
    const value = overrideValue ?? values[key] ?? "";
    if (lastSavedRef.current[key] === value) return; // ما تغيّر شيء — لا داعي لطلب شبكة
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

  const tab = ADMIN_SETTINGS_TABS.find((t) => t.id === activeTab) ?? ADMIN_SETTINGS_TABS[0];
  const settingsGroups = SETTINGS_GROUPS.filter((g) => tab.settingsGroupTitles.includes(g.title));
  const flagGroups = FLAG_GROUPS.filter((g) => tab.flagGroupTitles.includes(g.title));

  return (
    <div>
      {/* شريط التبويبات — يمرّر أفقياً بالجوال بدل ما يتكسر */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-none">
        {ADMIN_SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === t.id ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9]"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title} className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-4">{group.title}</h2>
            <div className="space-y-4">
              {group.fields.map(([key, label, desc]) => (
                <div key={key}>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-800 block">{label}</label>
                    {saving === key && <span className="text-[11px] text-gray-400">جارٍ الحفظ…</span>}
                    {savedKey === key && <span className="text-[11px] text-green-600">تم الحفظ ✓</span>}
                  </div>
                  {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                  <input
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    onBlur={() => saveSetting(key)}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
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

        {flagGroups.map((group) => (
          <div key={group.title} className="bg-white border border-gray-100 rounded-2xl p-5">
            {tab.settingsGroupTitles.length + tab.flagGroupTitles.length > 1 && (
              <h2 className="font-bold text-gray-900 mb-4">{group.title === "عام إضافي" ? "خيارات إضافية" : group.title}</h2>
            )}
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
    </div>
  );
}

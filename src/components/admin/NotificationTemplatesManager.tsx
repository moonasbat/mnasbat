"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Template = { key: string; category: string; title: string; body: string; placeholders: string[] };

export default function NotificationTemplatesManager({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, { title: string; body: string }>>(
    Object.fromEntries(templates.map((t) => [t.key, { title: t.title, body: t.body }]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const lastSavedRef = useRef<Record<string, { title: string; body: string }>>(
    Object.fromEntries(templates.map((t) => [t.key, { title: t.title, body: t.body }]))
  );

  async function save(key: string) {
    const current = values[key];
    const last = lastSavedRef.current[key];
    if (last.title === current.title && last.body === current.body) return;
    setSaving(key);
    await fetch("/api/admin/notification-templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...current }),
    });
    lastSavedRef.current[key] = current;
    setSaving(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
    router.refresh();
  }

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="font-bold text-gray-900 mb-3">{category}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {templates
              .filter((t) => t.category === category)
              .map((t) => (
                <div key={t.key} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 rounded-md px-2 py-0.5">{t.key}</span>
                    <div className="flex items-center gap-1.5">
                      {saving === t.key && <span className="text-[11px] text-gray-400">جارٍ الحفظ…</span>}
                      {savedKey === t.key && <span className="text-[11px] text-green-600">تم الحفظ ✓</span>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">العنوان</label>
                    <input
                      value={values[t.key].title}
                      onChange={(e) => setValues((v) => ({ ...v, [t.key]: { ...v[t.key], title: e.target.value } }))}
                      onBlur={() => save(t.key)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">النص</label>
                    <textarea
                      value={values[t.key].body}
                      onChange={(e) => setValues((v) => ({ ...v, [t.key]: { ...v[t.key], body: e.target.value } }))}
                      onBlur={() => save(t.key)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  {t.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {t.placeholders.map((p) => (
                        <span key={p} className="text-[11px] font-mono bg-purple-50 text-[#6D28D9] rounded-md px-2 py-0.5">
                          {`{${p}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

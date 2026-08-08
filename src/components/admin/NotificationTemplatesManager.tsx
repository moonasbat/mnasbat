"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Search } from "lucide-react";

type Template = { key: string; category: string; title: string; body: string; placeholders: string[] };

// معاينة نصية بسيطة — نستبدل كل {placeholder} بمثال واقعي عشان المالك يشوف شكل الإشعار الفعلي
const PLACEHOLDER_SAMPLES: Record<string, string> = {
  ad_title: "قاعة أفراح الماسة",
  days: "٣",
  reason: "مخالفة سياسة المحتوى",
  resolution_note: "تمت إزالة المحتوى المخالف",
};

function preview(text: string) {
  return text.replace(/\{(\w+)\}/g, (m, key) => PLACEHOLDER_SAMPLES[key] ?? m);
}

export default function NotificationTemplatesManager({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, { title: string; body: string }>>(
    Object.fromEntries(templates.map((t) => [t.key, { title: t.title, body: t.body }]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
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

  const q = query.trim().toLowerCase();
  const filtered = q
    ? templates.filter((t) => t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q))
    : templates;

  const categories = useMemo(() => Array.from(new Set(filtered.map((t) => t.category))), [filtered]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن إشعار (بالاسم أو النص)…"
          className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#6D28D9]"
        />
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">ما فيه نتائج مطابقة.</p>
      )}

      <div className="space-y-2">
        {categories.map((category) => {
          const items = filtered.filter((t) => t.category === category);
          const isOpen = q ? true : openCategory === category;
          return (
            <div key={category} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenCategory((c) => (c === category ? null : category))}
                className="w-full flex items-center justify-between gap-3 px-5 py-4"
              >
                <span className="flex items-center gap-2.5">
                  <span className="font-bold text-gray-900 text-sm">{category}</span>
                  <span className="text-[11px] bg-purple-50 text-[#6D28D9] rounded-full px-2 py-0.5 font-medium">{items.length}</span>
                </span>
                {!q && <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
              </button>

              {isOpen && (
                <div className="grid md:grid-cols-2 gap-4 px-5 pb-5 pt-1">
                  {items.map((t) => (
                    <div key={t.key} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 rounded-md px-2 py-0.5 truncate">{t.key}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
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
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-600">النص</label>
                          <span className="text-[10px] text-gray-400">{values[t.key].body.length} حرف</span>
                        </div>
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

                      {/* معاينة حية — شكل الإشعار الفعلي كما يظهر للمستخدم، بقيم مثال بدل الحقول */}
                      <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                        <span className="w-7 h-7 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Bell size={13} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{preview(values[t.key].title) || "—"}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{preview(values[t.key].body) || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

type CategoryOption = { id: string; name: string };

export default function AdminAdEditForm({
  adId,
  initial,
  categories,
}: {
  adId: string;
  initial: { title: string; description: string; category_id: string; city?: string; price?: number | null };
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(initial);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", fields: values }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6D28D9]">
        <Pencil size={13} /> تعديل بيانات الإعلان
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-4 mt-3 space-y-3 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">تعديل بيانات الإعلان</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">العنوان</label>
        <input value={values.title} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">الوصف</label>
        <textarea value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">التصنيف</label>
          <select
            value={values.category_id}
            onChange={(e) => setValues((v) => ({ ...v, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">المدينة</label>
          <input value={values.city ?? ""} onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">السعر</label>
        <input
          type="number"
          value={values.price ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, price: e.target.value ? Number(e.target.value) : null }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white max-w-[160px]"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-[#6D28D9] text-white rounded-xl px-5 py-2 text-sm font-medium disabled:opacity-60"
      >
        {saving ? "جارٍ الحفظ…" : "حفظ التعديلات"}
      </button>
    </div>
  );
}

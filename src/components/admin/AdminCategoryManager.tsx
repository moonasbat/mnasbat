"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

async function callApi(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
  const res = await fetch("/api/admin/categories", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function AddCategoryForm({ parentId, onDone }: { parentId?: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim()) return setError("اكتب اسم التصنيف.");
    setLoading(true);
    const { ok, data } = await callApi("POST", { name, icon, parent_id: parentId });
    setLoading(false);
    if (!ok) return setError(data.error ?? "تعذر الإضافة.");
    onDone();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-purple-50 rounded-xl p-3">
      {!parentId && (
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎉" className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" />
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={parentId ? "اسم التصنيف الفرعي" : "اسم التصنيف الرئيسي"}
        className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button onClick={submit} disabled={loading} className="bg-[#6D28D9] text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60">
        {loading ? "..." : "إضافة"}
      </button>
      <button onClick={onDone} className="text-xs text-gray-400">إلغاء</button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CategoryRow({ category, isSub }: { category: Category; isSub?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function saveEdit() {
    setLoading(true);
    const { ok, data } = await callApi("PATCH", { id: category.id, name, icon: isSub ? undefined : icon });
    setLoading(false);
    if (!ok) return setError(data.error ?? "تعذر الحفظ.");
    setEditing(false);
    router.refresh();
  }

  async function toggleActive() {
    setLoading(true);
    await callApi("PATCH", { id: category.id, is_active: !category.is_active });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`حذف "${category.name}"؟`)) return;
    setLoading(true);
    const { ok, data } = await callApi("DELETE", { id: category.id });
    setLoading(false);
    if (!ok) return alert(data.error ?? "تعذر الحذف.");
    router.refresh();
  }

  if (editing) {
    return (
      <div className={`flex items-center gap-2 py-2 ${isSub ? "pr-8" : ""}`}>
        {!isSub && <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center" />}
        <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
        <button onClick={saveEdit} disabled={loading} className="text-green-600"><Check size={16} /></button>
        <button onClick={() => setEditing(false)} className="text-gray-400"><X size={16} /></button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-2 py-2 ${isSub ? "pr-8 text-gray-600" : ""}`}>
      <span className="text-sm">{isSub ? "└ " : `${category.icon ?? "✨"} `}{category.name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-[#6D28D9]"><Pencil size={14} /></button>
        <button onClick={remove} disabled={loading} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
        <ToggleSwitch checked={category.is_active} onChange={toggleActive} />
      </div>
    </div>
  );
}

export default function AdminCategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const mains = categories.filter((c) => !c.parent_id);
  const [addingMain, setAddingMain] = useState(false);
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-1 divide-y divide-gray-50">
        {mains.map((main) => {
          const subs = categories.filter((c) => c.parent_id === main.id);
          return (
            <div key={main.id} className="py-2">
              <CategoryRow category={main} />
              {subs.map((sc) => (
                <CategoryRow key={sc.id} category={sc} isSub />
              ))}
              {addingSubFor === main.id ? (
                <div className="pr-8 pt-2">
                  <AddCategoryForm parentId={main.id} onDone={() => { setAddingSubFor(null); router.refresh(); }} />
                </div>
              ) : (
                <button onClick={() => setAddingSubFor(main.id)} className="flex items-center gap-1 text-xs text-[#6D28D9] pr-8 mt-1 hover:underline">
                  <Plus size={12} />
                  إضافة تصنيف فرعي
                </button>
              )}
            </div>
          );
        })}
      </div>

      {addingMain ? (
        <AddCategoryForm onDone={() => { setAddingMain(false); router.refresh(); }} />
      ) : (
        <button onClick={() => setAddingMain(true)} className="flex items-center gap-2 bg-[#6D28D9] text-white rounded-xl px-4 py-2.5 text-sm font-medium">
          <Plus size={16} />
          إضافة تصنيف رئيسي جديد
        </button>
      )}
    </div>
  );
}

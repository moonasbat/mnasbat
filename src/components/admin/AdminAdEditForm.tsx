"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Upload } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import SaudiPhoneInput from "@/components/SaudiPhoneInput";

type CategoryOption = { id: string; name: string };
type ImageItem = { id: string; url: string };

export default function AdminAdEditForm({
  adId,
  initial,
  categories,
  maxImages = 10,
}: {
  adId: string;
  initial: {
    title: string;
    description: string;
    category_id: string;
    city?: string;
    price?: number | null;
    whatsapp?: string | null;
    messages_enabled: boolean;
    comments_enabled: boolean;
    images: ImageItem[];
  };
  categories: CategoryOption[];
  maxImages?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { images: initialImages, whatsapp: initialWhatsapp, ...initialFields } = initial;
  const [values, setValues] = useState(initialFields);
  const [whatsappEnabled, setWhatsappEnabled] = useState(!!initialWhatsapp);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [images, setImages] = useState<ImageItem[]>(initialImages);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    const remaining = maxImages - images.length;
    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);
    for (const file of selected) {
      try {
        const uploaded = await uploadToCloudinary(file, "ad");
        const res = await fetch(`/api/admin/ads/${adId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_image", fields: { url: uploaded.url, public_id: uploaded.public_id } }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setImages((prev) => [...prev, { id: data.image?.id ?? uploaded.public_id, url: uploaded.url }]);
      } catch {
        setError("تعذر رفع إحدى الصور.");
      }
    }
    setUploading(false);
    router.refresh();
  }

  async function removeImage(imageId: string) {
    const res = await fetch(`/api/admin/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_image", fields: { imageId } }),
    });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      router.refresh();
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "edit",
        fields: {
          ...values,
          whatsapp: whatsappEnabled ? whatsapp : "",
        },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذر حفظ التعديلات.");
      return;
    }
    setOpen(false);
    router.refresh();
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
        <p className="text-sm font-bold text-gray-800">تعديل بيانات الإعلان (صلاحية إدارية كاملة)</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

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

      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
          <input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
          تفعيل واتساب
        </label>
        {whatsappEnabled && <SaudiPhoneInput value={whatsapp} onChange={setWhatsapp} />}
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" checked={values.messages_enabled} onChange={(e) => setValues((v) => ({ ...v, messages_enabled: e.target.checked }))} />
        السماح بالرسائل الخاصة
      </label>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" checked={values.comments_enabled} onChange={(e) => setValues((v) => ({ ...v, comments_enabled: e.target.checked }))} />
        السماح بالتعليقات
      </label>

      <div>
        <label className="text-xs font-medium text-gray-600 block mb-2">الصور — {images.length}/{maxImages}</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-contain" />
              <button onClick={() => removeImage(img.id)} className="absolute top-1 left-1 bg-white/90 rounded-full p-1">
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#6D28D9] transition-colors bg-white">
              <Upload size={16} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">{uploading ? "جارٍ الرفع…" : "إضافة"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
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

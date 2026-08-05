"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ad, AdImage, Category } from "@/lib/types";
import { NEW_AD_CONTENT } from "@/lib/content";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import SaudiPhoneInput from "@/components/SaudiPhoneInput";
import { X, Upload } from "lucide-react";

const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر",
  "الطائف", "تبوك", "بريدة", "حائل", "أبها", "خميس مشيط", "جازان", "نجران",
];

export default function EditAdForm({ ad, categories, maxImages = 10 }: { ad: Ad; categories: Category[]; maxImages?: number }) {
  const router = useRouter();
  const mainCategories = categories.filter((c) => !c.parent_id);
  const initialCategory = categories.find((c) => c.id === ad.category_id);
  const initialMainId = initialCategory?.parent_id ? initialCategory.parent_id : ad.category_id;
  const initialSubId = initialCategory?.parent_id ? ad.category_id : "";
  const [title, setTitle] = useState(ad.title);
  const [description, setDescription] = useState(ad.description);
  const [categoryId, setCategoryId] = useState(initialMainId);
  const [subCategoryId, setSubCategoryId] = useState(initialSubId);
  const [city, setCity] = useState(ad.city ?? "");
  const [price, setPrice] = useState(ad.price ? String(ad.price) : "");
  const [whatsapp, setWhatsapp] = useState(ad.whatsapp ?? "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(!!ad.whatsapp);
  const [messagesEnabled, setMessagesEnabled] = useState(ad.messages_enabled);
  const [commentsEnabled, setCommentsEnabled] = useState(ad.comments_enabled);
  const [images, setImages] = useState<AdImage[]>(ad.ad_images ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function uploadOne(file: File, sortOrder: number) {
    const supabase = createClient();
    const data = await uploadToCloudinary(file, "ad");
    const { data: inserted, error } = await supabase
      .from("ad_images")
      .insert({ ad_id: ad.id, url: data.url, cloudinary_public_id: data.public_id, sort_order: sortOrder })
      .select("*")
      .single();
    if (error || !inserted) throw new Error(NEW_AD_CONTENT.errors.uploadFailed);
    return inserted as AdImage;
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    const remaining = maxImages - images.length;
    const selected = Array.from(files).slice(0, remaining);

    const valid: File[] = [];
    for (const file of selected) {
      if (file.type.startsWith("video/")) {
        setError(NEW_AD_CONTENT.errors.videoNotAllowed);
        continue;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(NEW_AD_CONTENT.errors.imageNotSupported);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    // رفع كل الصور بالتوازي بدل التتابع — يقلّل وقت الانتظار الكلي بشكل كبير خصوصاً مع عدة صور
    setUploading(true);
    const startOrder = images.length;
    const results = await Promise.allSettled(valid.map((file, i) => uploadOne(file, startOrder + i)));
    setUploading(false);
    const uploaded = results.filter((r): r is PromiseFulfilledResult<AdImage> => r.status === "fulfilled").map((r) => r.value);
    const failed = results.some((r) => r.status === "rejected");
    if (uploaded.length > 0) setImages((prev) => [...prev, ...uploaded]);
    if (failed) setError(NEW_AD_CONTENT.errors.uploadFailed);
  }

  async function removeImage(imageId: string) {
    const supabase = createClient();
    await supabase.from("ad_images").delete().eq("id", imageId);
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function save() {
    if (!title.trim()) return setError(NEW_AD_CONTENT.errors.titleRequired);
    if (!description.trim()) return setError(NEW_AD_CONTENT.errors.descriptionRequired);
    if (!categoryId) return setError(NEW_AD_CONTENT.errors.categoryRequired);
    const whatsappActive = whatsappEnabled && !!whatsapp;
    if (!whatsappActive && !messagesEnabled) {
      return setError("يجب تفعيل التواصل عبر واتساب أو السماح بالرسائل الخاصة — وسيلة تواصل واحدة على الأقل مطلوبة.");
    }

    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update", title, description, category_id: subCategoryId || categoryId, city, price,
        whatsapp: whatsappActive ? whatsapp : "", messages_enabled: messagesEnabled, comments_enabled: commentsEnabled,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر حفظ التعديلات.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
      {saved && <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2">تم حفظ التعديلات بنجاح.</p>}

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.titleLabel}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.descriptionLabel}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.categoryLabel}</label>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
        >
          {mainCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {(() => {
        const subCategories = categories.filter((c) => c.parent_id === categoryId);
        if (subCategories.length === 0) return null;
        return (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">التصنيف الفرعي (اختياري)</label>
            <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="">بدون تصنيف فرعي</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        );
      })()}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.cityLabel}</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
          <option value="">{NEW_AD_CONTENT.cityPlaceholder}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.priceLabel}</label>
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
          {NEW_AD_CONTENT.whatsappLabel}
        </label>
        {whatsappEnabled && <SaudiPhoneInput value={whatsapp} onChange={setWhatsapp} />}
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={messagesEnabled} onChange={(e) => setMessagesEnabled(e.target.checked)} />
        {NEW_AD_CONTENT.allowMessages}
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} />
        {NEW_AD_CONTENT.allowComments}
      </label>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">{NEW_AD_CONTENT.imagesLabel}</label>
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(img.id)} className="absolute top-1 left-1 bg-white/90 rounded-full p-1">
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#6D28D9] transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400">{uploading ? "جارٍ الرفع…" : NEW_AD_CONTENT.addImages}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">{NEW_AD_CONTENT.maxImages} — {images.length}/{maxImages}</p>
      </div>

      <button onClick={save} disabled={saving} className="w-full bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-50">
        حفظ التعديلات
      </button>
    </div>
  );
}

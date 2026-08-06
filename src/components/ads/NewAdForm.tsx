"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { NEW_AD_CONTENT, COMMISSION_DECLARATION_TEXT, COMMISSION_DECLARATION_CONTENT } from "@/lib/content";
import { createClient } from "@/lib/supabase/client";
import { X, Upload, ShieldCheck, CheckCircle2, Circle, ChevronDown, MapPin, Loader2 } from "lucide-react";
import SaudiPhoneInput from "@/components/SaudiPhoneInput";
import { SAUDI_CITIES, nearestSaudiCity, suggestCategorySlug } from "@/lib/saudiCities";
import { adUrl } from "@/lib/adSlug";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

const DRAFT_STORAGE_KEY = "mnasbat_new_ad_draft";

// previewUrl يظهر فوراً محلياً (قبل ما ينتهي الرفع) عشان المستخدم ما يحس بأي تأخير — url الحقيقي يوصل بعد اكتمال الرفع لكلاودنري
type ImageItem = { tempId: string; previewUrl: string; url: string; public_id: string; uploading: boolean; error?: boolean };

type PersistedDraft = {
  step: number;
  title: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  city: string;
  price: string;
  whatsapp: string;
  whatsappEnabled: boolean;
  messagesEnabled: boolean;
  commentsEnabled: boolean;
  images: { url: string; public_id: string }[];
  adId: string | null;
  adSlug: string | null;
  declarationAccepted: boolean;
};

export default function NewAdForm({ categories, initialWhatsapp, maxImages = 10 }: { categories: Category[]; initialWhatsapp?: string; maxImages?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [price, setPrice] = useState("");
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [messagesEnabled, setMessagesEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState("");
  const [adId, setAdId] = useState<string | null>(null);
  const [adSlug, setAdSlug] = useState<string | null>(null);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [savingStep3, setSavingStep3] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationExpanded, setDeclarationExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);

  const mainCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id === categoryId);

  // نسترجع مسودة محفوظة محلياً بس لو الصفحة اتحدّثت فعلياً (Refresh) — يمنع ضياع الشغل عند تحديث الصفحة بالخطأ.
  // لو المستخدم دخل الصفحة من جديد (تنقل عادي) نبدأ من الخطوة الأولى دائماً، حتى لو فيه مسودة قديمة متروكة.
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      const isReload = navEntries[0]?.type === "reload";
      const raw = isReload ? localStorage.getItem(DRAFT_STORAGE_KEY) : null;
      if (raw) {
        const d: PersistedDraft = JSON.parse(raw);
        setStep(d.step ?? 1);
        setTitle(d.title ?? "");
        setDescription(d.description ?? "");
        setCategoryId(d.categoryId ?? "");
        setSubCategoryId(d.subCategoryId ?? "");
        if (d.categoryId) setCategoryTouched(true);
        setCity(d.city ?? "");
        setPrice(d.price ?? "");
        setWhatsapp(d.whatsapp ?? initialWhatsapp ?? "");
        setWhatsappEnabled(d.whatsappEnabled ?? true);
        setMessagesEnabled(d.messagesEnabled ?? true);
        setCommentsEnabled(d.commentsEnabled ?? true);
        setImages((d.images ?? []).map((i) => ({ tempId: i.public_id, previewUrl: i.url, url: i.url, public_id: i.public_id, uploading: false })));
        setAdId(d.adId ?? null);
        setAdSlug(d.adSlug ?? null);
        setDeclarationAccepted(d.declarationAccepted ?? false);
      }
    } catch {}
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // نحفظ كل تغيير محلياً (بعد أول استرجاع، عشان ما نكتب فوق نسخة محفوظة قبل ما نقرأها)
  useEffect(() => {
    if (!restored) return;
    const draft: PersistedDraft = {
      step, title, description, categoryId, subCategoryId, city, price,
      whatsapp, whatsappEnabled, messagesEnabled, commentsEnabled,
      images: images.filter((i) => !i.uploading && i.url).map(({ url, public_id }) => ({ url, public_id })),
      adId, adSlug, declarationAccepted,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [restored, step, title, description, categoryId, subCategoryId, city, price, whatsapp, whatsappEnabled, messagesEnabled, commentsEnabled, images, adId, adSlug, declarationAccepted]);

  // اقتراح تصنيف تلقائي من العنوان — لا يُطبَّق إذا المستخدم غيّر التصنيف يدوياً
  useEffect(() => {
    if (categoryTouched) return;
    const slug = suggestCategorySlug(title);
    if (!slug) return;
    const match = mainCategories.find((c) => c.slug === slug);
    if (match) setCategoryId(match.id);
  }, [title, categories, categoryTouched]);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCity(nearestSaudiCity(pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  async function uploadOne(file: File) {
    try {
      return await uploadToCloudinary(file, "ad");
    } catch {
      throw new Error(NEW_AD_CONTENT.errors.uploadFailed);
    }
  }

  function handleFiles(files: FileList | null) {
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

    // نعرض كل صورة فوراً من الجهاز نفسه (قبل ما يخلص الرفع) عشان المستخدم ما يحس بأي ثقل —
    // الرفع الفعلي لكلاودنري يصير بالخلفية بالتوازي، وكل صورة تتحدث لحالها لما تخلص
    const pending: ImageItem[] = valid.map((file) => ({
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      url: "",
      public_id: "",
      uploading: true,
    }));
    setImages((prev) => [...prev, ...pending]);

    pending.forEach((item, i) => {
      uploadOne(valid[i])
        .then((data) => {
          setImages((prev) => prev.map((img) => (img.tempId === item.tempId ? { ...img, url: data.url, public_id: data.public_id, uploading: false } : img)));
        })
        .catch(() => {
          setImages((prev) => prev.map((img) => (img.tempId === item.tempId ? { ...img, uploading: false, error: true } : img)));
          setError(NEW_AD_CONTENT.errors.uploadFailed);
        });
    });
  }

  function removeImage(tempId: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.tempId === tempId);
      if (target?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.tempId !== tempId);
    });
  }

  function validateStep1() {
    if (!title.trim()) return setError(NEW_AD_CONTENT.errors.titleRequired), false;
    if (!description.trim()) return setError(NEW_AD_CONTENT.errors.descriptionRequired), false;
    if (!categoryId) return setError(NEW_AD_CONTENT.errors.categoryRequired), false;
    if (price && (isNaN(Number(price)) || Number(price) < 0)) return setError(NEW_AD_CONTENT.errors.priceInvalid), false;
    setError("");
    return true;
  }

  async function createDraft() {
    setCreatingDraft(true);
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description, category_id: subCategoryId || categoryId, city, price,
        whatsapp: whatsappEnabled ? whatsapp : "", messages_enabled: messagesEnabled, comments_enabled: commentsEnabled,
      }),
    });
    setCreatingDraft(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر إنشاء الإعلان.");
      return null;
    }
    const data = await res.json();
    setAdSlug(data.slug ?? null);
    return data.id as string;
  }

  async function attachImages(id: string) {
    const supabase = createClient();
    const finished = images.filter((i) => i.url && !i.uploading);
    for (let i = 0; i < finished.length; i++) {
      await supabase.from("ad_images").insert({
        ad_id: id,
        url: finished[i].url,
        cloudinary_public_id: finished[i].public_id,
        sort_order: i,
      });
    }
  }

  async function goToStep2() {
    if (!validateStep1()) return;
    if (!adId) {
      const id = await createDraft();
      if (!id) return;
      setAdId(id);
    }
    setStep(2);
  }

  async function goToStep3() {
    setError("");
    if (adId && images.length > 0) await attachImages(adId);
    setStep(3);
  }

  async function goToStep4() {
    if (!adId) return;
    const whatsappActive = whatsappEnabled && !!whatsapp;
    if (!whatsappActive && !messagesEnabled) {
      setError("يجب تفعيل التواصل عبر واتساب أو السماح بالرسائل الخاصة — وسيلة تواصل واحدة على الأقل مطلوبة.");
      return;
    }
    setSavingStep3(true);
    setError("");
    const res = await fetch(`/api/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update", title, description, category_id: subCategoryId || categoryId, city, price,
        whatsapp: whatsappActive ? whatsapp : "", messages_enabled: messagesEnabled, comments_enabled: commentsEnabled,
      }),
    });
    setSavingStep3(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر حفظ البيانات.");
      return;
    }
    setStep(4);
  }

  async function submitPublish() {
    if (!declarationAccepted) {
      setError(COMMISSION_DECLARATION_CONTENT.requiredError);
      return;
    }
    if (!adId) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/ads/${adId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted: true }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر نشر الإعلان.");
      return;
    }
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    router.push(adUrl({ id: adId, slug: adSlug }));
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-[#6D28D9]" : "bg-gray-200"}`} />
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.titleLabel}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={NEW_AD_CONTENT.titlePlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.descriptionLabel}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={NEW_AD_CONTENT.descriptionPlaceholder} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.categoryLabel}</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); setCategoryTouched(true); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="">{NEW_AD_CONTENT.categoryPlaceholder}</option>
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {!categoryTouched && categoryId && (
              <p className="text-xs text-[#6D28D9] mt-1">تم اقتراح هذا التصنيف تلقائياً — يمكنك تغييره.</p>
            )}
          </div>
          {categoryId && subCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">التصنيف الفرعي (اختياري)</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">بدون تصنيف فرعي</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 block">{NEW_AD_CONTENT.cityLabel}</label>
              <button type="button" onClick={detectLocation} className="flex items-center gap-1 text-xs text-[#6D28D9] hover:underline">
                {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                {locating ? "جارٍ تحديد موقعك…" : "استخدم موقعي الحالي"}
              </button>
            </div>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
              <option value="">{NEW_AD_CONTENT.cityPlaceholder}</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{NEW_AD_CONTENT.priceLabel} (اختياري)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={NEW_AD_CONTENT.pricePlaceholder} type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <button
            onClick={goToStep2}
            disabled={creatingDraft}
            className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-60"
          >
            {creatingDraft && <Loader2 size={16} className="animate-spin" />}
            {creatingDraft ? "جارٍ الحفظ…" : NEW_AD_CONTENT.continue}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 block">{NEW_AD_CONTENT.imagesLabel} (اختياري)</label>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{NEW_AD_CONTENT.videoNotice}</p>

          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.tempId} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl || img.url} alt="" className="w-full h-full object-contain" />
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <span className="text-[10px] text-red-700 bg-white/90 rounded px-1.5 py-0.5">فشل الرفع</span>
                  </div>
                )}
                <button onClick={() => removeImage(img.tempId)} className="absolute top-1 left-1 bg-white/90 rounded-full p-1">
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < maxImages && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#6D28D9] transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-xs text-gray-400">{NEW_AD_CONTENT.addImages}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">{NEW_AD_CONTENT.maxImages} — {images.length}/{maxImages}</p>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium">رجوع</button>
            <button onClick={goToStep3} disabled={images.some((i) => i.uploading)} className="flex-1 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-60">
              {images.some((i) => i.uploading) ? "جارٍ رفع الصور…" : NEW_AD_CONTENT.continue}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
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
          <p className="text-xs text-gray-400">لازم رقم واتساب أو تفعيل الرسائل الخاصة — وسيلة تواصل واحدة على الأقل حتى يقدر المهتمون يتواصلون معك.</p>

          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
            <p className="font-bold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-3">{description}</p>
            {price && <p className="text-sm font-bold text-[#6D28D9] mt-2">{price} ر.س</p>}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium">رجوع</button>
            <button
              onClick={goToStep4}
              disabled={savingStep3}
              className="flex-1 flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-60"
            >
              {savingStep3 && <Loader2 size={16} className="animate-spin" />}
              {savingStep3 ? "جارٍ الحفظ…" : NEW_AD_CONTENT.preview}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#6D28D9]">
            <ShieldCheck size={20} />
            <h2 className="font-bold text-gray-900">إقرار الالتزام بالعمولة</h2>
          </div>

          <button
            type="button"
            onClick={() => setDeclarationExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-[#6D28D9] hover:underline"
          >
            <ChevronDown size={16} className={`transition-transform ${declarationExpanded ? "rotate-180" : ""}`} />
            {declarationExpanded ? "إخفاء نص الإقرار" : "قراءة نص الإقرار كاملاً"}
          </button>

          {declarationExpanded && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              {COMMISSION_DECLARATION_TEXT.map((t, i) => (
                <div key={i} className={`flex gap-3 p-4 text-sm text-gray-700 leading-relaxed ${i > 0 ? "border-t border-gray-100" : ""}`}>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-purple-50 text-[#6D28D9] text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setDeclarationAccepted((v) => !v)}
            className={`w-full flex items-center gap-3 rounded-2xl p-4 text-right transition-colors border-2 ${
              declarationAccepted
                ? "bg-purple-50 border-[#6D28D9]"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            {declarationAccepted ? (
              <CheckCircle2 size={22} className="text-[#6D28D9] shrink-0" />
            ) : (
              <Circle size={22} className="text-gray-300 shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-900">
              أوافق على إقرار الالتزام بالعمولة
            </span>
          </button>

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium">رجوع</button>
            <button
              onClick={submitPublish}
              disabled={!declarationAccepted || submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "جارٍ النشر…" : COMMISSION_DECLARATION_CONTENT.submitButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

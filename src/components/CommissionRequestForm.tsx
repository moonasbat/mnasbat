"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Ad } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import { loginUrl } from "@/lib/loginRedirect";
import { Loader2, Upload } from "lucide-react";

export default function CommissionRequestForm({
  ads,
  rate,
  isLoggedIn,
  preselectedAdId,
}: {
  ads: Ad[];
  rate: number;
  isLoggedIn: boolean;
  preselectedAdId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adId, setAdId] = useState(preselectedAdId ?? "");
  const [oldAd, setOldAd] = useState(false);
  const [oldAdNote, setOldAdNote] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealType, setDealType] = useState("sale");
  const [inPlatform, setInPlatform] = useState(true);
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const commissionAmount = useMemo(() => {
    const v = Number(dealValue) || 0;
    return Math.round((v * rate) / 100 * 100) / 100;
  }, [dealValue, rate]);

  async function submit() {
    if (!isLoggedIn) {
      router.push(loginUrl(pathname));
      return;
    }
    if (!oldAd && !adId) {
      setError("اختر الإعلان.");
      return;
    }
    if (oldAd && !oldAdNote.trim()) {
      setError("اكتب وصفاً للإعلان القديم.");
      return;
    }
    if (!dealValue || Number(dealValue) <= 0) {
      setError("أدخل قيمة الصفقة.");
      return;
    }
    if (!receiptFile) {
      setError("يرجى إرفاق صورة إيصال التحويل.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", receiptFile);
    formData.append("type", "receipt");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const data = await uploadRes.json();
      setError(data.error ?? "تعذر رفع الإيصال.");
      setLoading(false);
      return;
    }
    const { url } = await uploadRes.json();

    const res = await fetch("/api/commission/report-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad_id: oldAd ? null : adId,
        ad_reference_text: oldAd ? oldAdNote : null,
        deal_value: dealValue,
        deal_type: dealType,
        in_platform: inPlatform,
        notes,
        receipt_url: url,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر إرسال الطلب.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <p className="text-green-700 font-medium">تم إرسال الإيصال وهو قيد المراجعة.</p>
        <p className="text-sm text-green-600 mt-1">راجع "عمولاتي" لمتابعة حالة الطلب.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">الإعلان</label>
        {!oldAd ? (
          <select value={adId} onChange={(e) => setAdId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="">اختر الإعلان</option>
            {ads.map((a) => (
              <option key={a.id} value={a.id}>{a.title} — {AD_STATUS_LABELS[a.status]}</option>
            ))}
          </select>
        ) : (
          <input
            value={oldAdNote}
            onChange={(e) => setOldAdNote(e.target.value)}
            placeholder="اكتب عنوان الإعلان القديم أو أي تفاصيل تساعدنا في التعرف عليه"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
        )}
        <label className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <input type="checkbox" checked={oldAd} onChange={(e) => setOldAd(e.target.checked)} />
          إعلان قديم أو محذوف وغير موجود في القائمة
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">قيمة الصفقة (ر.س)</label>
        <input value={dealValue} onChange={(e) => setDealValue(e.target.value)} type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        {Number(dealValue) > 0 && (
          <p className="text-sm text-[#6D28D9] font-medium mt-2 bg-purple-50 rounded-xl px-3 py-2">
            العمولة المستحقة ({rate}%): {commissionAmount.toLocaleString("ar-SA")} ر.س
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">نوع الصفقة</label>
        <select value={dealType} onChange={(e) => setDealType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="sale">بيع</option>
          <option value="rent">تأجير</option>
          <option value="service">خدمة</option>
          <option value="request">طلب</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={inPlatform} onChange={(e) => setInPlatform(e.target.checked)} />
        تمت الصفقة داخل مناسبات
      </label>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">ملاحظات (اختياري)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">صورة إيصال التحويل</label>
        <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-pointer hover:border-[#6D28D9] transition-colors">
          <Upload size={16} />
          {receiptFile ? receiptFile.name : "اختر صورة الإيصال"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <p className="text-xs text-gray-400">رفع الإيصال لا يعني اعتماد الدفع. يتم اعتماد العملية بعد مراجعة التحويل من فريق مناسبات.</p>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "جارٍ الإرسال…" : isLoggedIn ? "إرسال" : "سجّل الدخول للإرسال"}
      </button>
    </div>
  );
}

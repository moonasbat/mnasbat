"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ad } from "@/lib/types";

export default function ReportDealForm({ ads }: { ads: Ad[] }) {
  const router = useRouter();
  const [adId, setAdId] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealType, setDealType] = useState("sale");
  const [inPlatform, setInPlatform] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function submit() {
    if (!adId || !dealValue) {
      setError("اختر الإعلان وأدخل قيمة الصفقة.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/commission/report-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: adId, deal_value: dealValue, deal_type: dealType, in_platform: inPlatform, notes }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر تسجيل الصفقة.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium">
        تمت صفقة بسبب هذا الإعلان
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <select value={adId} onChange={(e) => setAdId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
        <option value="">اختر الإعلان</option>
        {ads.map((a) => (
          <option key={a.id} value={a.id}>{a.title}</option>
        ))}
      </select>
      <input value={dealValue} onChange={(e) => setDealValue(e.target.value)} type="number" placeholder="قيمة الصفقة" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <select value={dealType} onChange={(e) => setDealType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
        <option value="sale">بيع</option>
        <option value="rent">تأجير</option>
        <option value="service">خدمة</option>
        <option value="request">طلب</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={inPlatform} onChange={(e) => setInPlatform(e.target.checked)} />
        تمت الصفقة داخل مناسبات
      </label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <p className="text-xs text-gray-400">يظهر للمعلن أن تسجيل الصفقة لا يعني أن مناسبات طرف في الصفقة.</p>
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm">إلغاء</button>
        <button onClick={submit} disabled={loading} className="flex-1 bg-[#6D28D9] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60">حفظ</button>
      </div>
    </div>
  );
}

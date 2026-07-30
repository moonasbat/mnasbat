"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMISSION_CONTENT } from "@/lib/content";

export default function ReceiptUploadForm({ obligationId }: { obligationId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [transferName, setTransferName] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function submit() {
    if (!file) {
      setError("يرجى اختيار ملف الإيصال.");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "receipt");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const data = await uploadRes.json();
      setError(data.error ?? "تعذر رفع الإيصال.");
      setLoading(false);
      return;
    }
    const { url } = await uploadRes.json();

    const res = await fetch(`/api/commission/${obligationId}/receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_url: url, transfer_name: transferName, transfer_date: transferDate || null }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "تعذر إرسال الإيصال.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-[#6D28D9] font-medium hover:underline">
        {COMMISSION_CONTENT.uploadReceipt}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 bg-gray-50 rounded-xl p-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
      <input value={transferName} onChange={(e) => setTransferName(e.target.value)} placeholder="اسم المحوّل" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
      <input value={transferDate} onChange={(e) => setTransferDate(e.target.value)} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
      <p className="text-xs text-gray-400">{COMMISSION_CONTENT.receiptNotApproval}</p>
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs">إلغاء</button>
        <button onClick={submit} disabled={loading} className="flex-1 bg-[#6D28D9] text-white rounded-lg py-1.5 text-xs font-medium disabled:opacity-60">
          {COMMISSION_CONTENT.sendForReview}
        </button>
      </div>
    </div>
  );
}

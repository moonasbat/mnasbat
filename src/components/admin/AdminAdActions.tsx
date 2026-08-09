"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdStatus } from "@/lib/types";

export default function AdminAdActions({ adId, status }: { adId: string; status: AdStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function act(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setLoading(false);
    if (res.ok) {
      setShowReject(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذر تنفيذ الإجراء.");
    }
  }

  async function hardDelete() {
    if (!confirm("حذف نهائي كامل من قاعدة البيانات — لا يمكن التراجع عن هذا الإجراء إطلاقاً. متأكد؟")) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ads/${adId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/ads");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذر الحذف — يحتاج صلاحية أدمن.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap gap-2 text-xs items-center">
        {status === "pending_review" && (
          <>
            <button disabled={loading} onClick={() => act("approve")} className="text-green-600 hover:underline">اعتماد</button>
            <button disabled={loading} onClick={() => setShowReject(true)} className="text-red-600 hover:underline">رفض</button>
          </>
        )}
        {status === "published" && (
          <button disabled={loading} onClick={() => act("pause")} className="text-amber-600 hover:underline">إيقاف</button>
        )}
        {status !== "draft" && (
          <button disabled={loading} onClick={() => act("renew")} className="text-[#6D28D9] hover:underline">تجديد</button>
        )}
        {status !== "removed" && (
          <button disabled={loading} onClick={() => act("remove")} className="text-red-600 hover:underline">إزالة</button>
        )}
        <button disabled={loading} onClick={hardDelete} className="text-red-700 font-bold hover:underline">حذف نهائي</button>
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}

      {showReject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReject(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-900 mb-2">سبب الرفض</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3" />
            <button
              onClick={() => act("reject", { reason })}
              disabled={!reason || loading}
              className="w-full bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
            >
              تأكيد الرفض
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

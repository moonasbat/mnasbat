"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdStatus } from "@/lib/types";

export default function AdminAdActions({ adId, status }: { adId: string; status: AdStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setLoading(false);
    if (res.ok) {
      setShowReject(false);
      router.refresh();
    }
  }

  return (
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
      {status !== "removed" && (
        <button disabled={loading} onClick={() => act("remove")} className="text-red-600 hover:underline">حذف</button>
      )}

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

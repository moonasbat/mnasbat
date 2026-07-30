"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reply.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? "تعذر إرسال الرد.");
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-[#6D28D9] font-medium hover:underline mt-2">
        الرد على التقييم
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="اكتب ردك على هذا التقييم…"
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading || !reply.trim()} className="bg-[#6D28D9] text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60">
          إرسال الرد
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400">إلغاء</button>
      </div>
    </div>
  );
}

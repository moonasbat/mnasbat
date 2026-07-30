"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddReviewForm({ revieweeId, isLoggedIn }: { revieweeId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPositive, setIsPositive] = useState(true);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function toggle() {
    if (!isLoggedIn) return router.push("/login");
    setOpen((o) => !o);
  }

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewee_id: revieweeId, is_positive: isPositive, comment }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setComment("");
    }
  }

  return (
    <div>
      <button onClick={toggle} className="text-sm text-[#6D28D9] font-medium hover:underline">
        {open ? "إغلاق" : "أضف تقييمك"}
      </button>

      {open && (
        <div className="mt-3 bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          {sent ? (
            <p className="text-sm text-green-600">تم إرسال تقييمك وهو بانتظار المراجعة.</p>
          ) : (
            <>
              <div className="flex gap-2">
                <button onClick={() => setIsPositive(true)} className={`flex-1 rounded-xl py-2 text-sm ${isPositive ? "bg-green-50 text-green-600 border border-green-200" : "border border-gray-200 text-gray-500"}`}>إيجابي</button>
                <button onClick={() => setIsPositive(false)} className={`flex-1 rounded-xl py-2 text-sm ${!isPositive ? "bg-red-50 text-red-600 border border-red-200" : "border border-gray-200 text-gray-500"}`}>سلبي</button>
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تجربتك…" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <button onClick={submit} disabled={loading || !comment.trim()} className="w-full bg-[#6D28D9] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60">
                إرسال التقييم
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

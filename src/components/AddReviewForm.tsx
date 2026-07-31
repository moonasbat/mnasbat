"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loginUrl } from "@/lib/loginRedirect";
import { StarRatingPicker } from "@/components/StarRating";

export default function AddReviewForm({ revieweeId, isLoggedIn }: { revieweeId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function toggle() {
    if (!isLoggedIn) return router.push(loginUrl(pathname));
    setOpen((o) => !o);
  }

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewee_id: revieweeId, rating, comment }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setComment("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذر إرسال التقييم.");
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
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">تقييمك</label>
                <StarRatingPicker value={rating} onChange={setRating} />
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تجربتك…" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              {error && <p className="text-xs text-red-600">{error}</p>}
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

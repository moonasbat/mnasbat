"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(status: string) {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      <button disabled={loading} onClick={() => act("approved")} className="text-green-600 hover:underline">قبول</button>
      <button disabled={loading} onClick={() => act("rejected")} className="text-red-600 hover:underline">رفض</button>
    </div>
  );
}

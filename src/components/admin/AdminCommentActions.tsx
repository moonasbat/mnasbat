"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCommentActions({ commentId, status }: { commentId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(newStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      {status !== "visible" && (
        <button disabled={loading} onClick={() => act("visible")} className="text-green-600 hover:underline">إظهار</button>
      )}
      {status !== "hidden" && (
        <button disabled={loading} onClick={() => act("hidden")} className="text-amber-600 hover:underline">إخفاء</button>
      )}
      {status !== "removed" && (
        <button disabled={loading} onClick={() => act("removed")} className="text-red-600 hover:underline">حذف</button>
      )}
    </div>
  );
}

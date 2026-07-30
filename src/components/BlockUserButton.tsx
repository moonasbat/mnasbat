"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REPORTS_CONTENT } from "@/lib/content";

export default function BlockUserButton({ userId, isLoggedIn }: { userId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function block() {
    if (!isLoggedIn) return router.push("/login");
    setLoading(true);
    await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_id: userId }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">{REPORTS_CONTENT.confirmBlock}</span>
        <button onClick={block} disabled={loading} className="text-red-600 font-medium">تأكيد</button>
        <button onClick={() => setConfirming(false)} className="text-gray-400">إلغاء</button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
      {REPORTS_CONTENT.blockUser}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(status: string) {
    setLoading(true);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      <button disabled={loading} onClick={() => act("in_review")} className="text-blue-600 hover:underline">قيد المراجعة</button>
      <button disabled={loading} onClick={() => act("action_taken")} className="text-green-600 hover:underline">إجراء متخذ</button>
      <button disabled={loading} onClick={() => act("closed")} className="text-gray-500 hover:underline">إغلاق</button>
    </div>
  );
}

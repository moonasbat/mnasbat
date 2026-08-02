"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdStatus } from "@/lib/types";
import { MY_ADS_CONTENT } from "@/lib/content";

const EDIT_WINDOW_MS = 5 * 60 * 1000;

export default function AdActions({
  adId,
  status,
  createdAt,
  renewalEnabled = true,
}: {
  adId: string;
  status: AdStatus;
  createdAt: string;
  renewalEnabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const canEdit = Date.now() - new Date(createdAt).getTime() <= EDIT_WINDOW_MS;

  async function act(action: string) {
    setLoading(true);
    await fetch(`/api/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("هل تريد حذف هذا الإعلان نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setLoading(true);
    await fetch(`/api/ads/${adId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {canEdit ? (
        <a href={`/ads/${adId}/edit`} className="text-[#6D28D9] hover:underline">{MY_ADS_CONTENT.edit}</a>
      ) : (
        <span className="text-gray-300 cursor-not-allowed" title="لا يمكن التعديل بعد مرور 5 دقائق من نشر الإعلان">{MY_ADS_CONTENT.edit}</span>
      )}
      {status === "published" && (
        <button disabled={loading} onClick={() => act("pause")} className="text-amber-600 hover:underline">{MY_ADS_CONTENT.pause}</button>
      )}
      {status === "paused" && (
        <button disabled={loading} onClick={() => act("resume")} className="text-green-600 hover:underline">{MY_ADS_CONTENT.resume}</button>
      )}
      {(status === "expired" || status === "paused") && renewalEnabled && (
        <button disabled={loading} onClick={() => act("renew")} className="text-[#6D28D9] hover:underline">{MY_ADS_CONTENT.renew}</button>
      )}
      <button disabled={loading} onClick={remove} className="text-red-600 hover:underline">{MY_ADS_CONTENT.delete}</button>
    </div>
  );
}

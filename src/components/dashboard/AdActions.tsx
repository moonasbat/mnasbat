"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdStatus } from "@/lib/types";
import { MY_ADS_CONTENT } from "@/lib/content";

export default function AdActions({ adId, status, renewalEnabled = true }: { adId: string; status: AdStatus; renewalEnabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    if (!confirm("هل تريد حذف هذا الإعلان؟")) return;
    setLoading(true);
    await fetch(`/api/ads/${adId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <a href={`/ads/${adId}/edit`} className="text-[#6D28D9] hover:underline">{MY_ADS_CONTENT.edit}</a>
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

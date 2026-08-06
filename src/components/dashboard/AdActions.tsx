"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdStatus } from "@/lib/types";
import { MY_ADS_CONTENT } from "@/lib/content";

const RENEW_WINDOW_DAYS = 7;

export default function AdActions({
  adId,
  status,
  expiresAt,
  renewalEnabled = true,
}: {
  adId: string;
  status: AdStatus;
  expiresAt?: string | null;
  renewalEnabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const daysUntilExpiry = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000) : null;
  const nearingExpiry = status === "published" && daysUntilExpiry !== null && daysUntilExpiry <= RENEW_WINDOW_DAYS;
  const showRenew = (status === "expired" || status === "paused" || nearingExpiry) && renewalEnabled;

  async function act(action: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "تعذر تنفيذ الإجراء.");
      return;
    }
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
    <div>
      <div className="flex flex-wrap gap-2 text-xs">
        <a href={`/ads/${adId}/edit`} className="text-[#6D28D9] hover:underline">{MY_ADS_CONTENT.edit}</a>
        {status === "published" && (
          <button disabled={loading} onClick={() => act("pause")} className="text-amber-600 hover:underline">{MY_ADS_CONTENT.pause}</button>
        )}
        {status === "paused" && (
          <button disabled={loading} onClick={() => act("resume")} className="text-green-600 hover:underline">{MY_ADS_CONTENT.resume}</button>
        )}
        {showRenew && (
          <button disabled={loading} onClick={() => act("renew")} className="text-[#6D28D9] hover:underline font-medium">{MY_ADS_CONTENT.renew}</button>
        )}
        <button disabled={loading} onClick={remove} className="text-red-600 hover:underline">{MY_ADS_CONTENT.delete}</button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

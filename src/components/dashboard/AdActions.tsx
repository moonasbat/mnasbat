"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdStatus } from "@/lib/types";
import { MY_ADS_CONTENT } from "@/lib/content";

export default function AdActions({
  adId,
  status,
  renewalEnabled = true,
  onDeleted,
}: {
  adId: string;
  status: AdStatus;
  expiresAt?: string | null;
  renewalEnabled?: boolean;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showRenew = renewalEnabled && status !== "draft";

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
    setError("");
    const res = await fetch(`/api/ads/${adId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("تعذر حذف الإعلان.");
      return;
    }
    // نشيله فوراً من القائمة محلياً بدل الاعتماد فقط على router.refresh() —
    // كان أحياناً يُحذف فعلياً بقاعدة البيانات لكن يبقى ظاهر بالقائمة لين تحديث الصفحة يدوياً
    onDeleted?.();
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 text-xs">
        <a href={`/ads/${adId}/edit`} className="text-[#6D28D9] hover:underline">{MY_ADS_CONTENT.edit}</a>
        {showRenew && (
          <button disabled={loading} onClick={() => act("renew")} className="text-[#6D28D9] hover:underline font-medium">{MY_ADS_CONTENT.renew}</button>
        )}
        <button disabled={loading} onClick={remove} className="text-red-600 hover:underline">{MY_ADS_CONTENT.delete}</button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

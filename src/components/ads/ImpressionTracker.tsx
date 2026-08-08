"use client";

import { useEffect } from "react";

// يسجّل "مرة ظهور" لكل الإعلانات المعروضة بصفحة القائمة (الرئيسية/البحث) بطلب واحد بعد التحميل —
// إحصائية منفصلة عن "المشاهدات" (فتح صفحة الإعلان نفسها)، تعكس مدى ظهور الإعلان فعلياً للزوار
export default function ImpressionTracker({ adIds }: { adIds: string[] }) {
  const key = adIds.join(",");
  useEffect(() => {
    if (!key) return;
    fetch("/api/ads/impressions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_ids: key.split(",") }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

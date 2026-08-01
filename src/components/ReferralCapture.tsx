"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE_NAME = "mnasbat_ref";

// يلتقط ?ref=username من الرابط ويحفظه في كوكي 30 يوم، لربطه بالحساب عند إكمال التسجيل لاحقاً
export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    if (document.cookie.includes(`${COOKIE_NAME}=`)) return;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; max-age=${30 * 86400}; path=/; SameSite=Lax`;
  }, [searchParams]);

  return null;
}

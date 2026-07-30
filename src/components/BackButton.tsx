"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

// يستخدم سجل المتصفح (router.back) بدل رابط عادي — يحافظ على موضع التمرير بالضبط
export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6D28D9] transition-colors shrink-0">
      <ChevronRight size={16} />
      رجوع
    </button>
  );
}

"use client";

import { useEffect } from "react";

// السكربت المباشر بالـ<head> يضبط الوضع الليلي فوراً قبل ظهور الصفحة (يمنع وميض الوضع الخطأ)،
// لكن أي خطأ Hydration بمكان ثاني بالشجرة يخلي React يعيد رسم <html> من الصفر ويمسح الكلاس
// اللي أضفناه يدوياً (لأنه مو جزء من الـJSX أصلاً). هذا المكوّن يعيد ضبطه بعد اكتمال React
// كصمام أمان — يضمن ثبات الوضع الافتراضي حتى لو صار Hydration recovery.
export default function ThemeInit() {
  useEffect(() => {
    try {
      const isLight = localStorage.getItem("theme") === "light";
      document.documentElement.classList.toggle("dark", !isLight);
    } catch {}
  }, []);

  return null;
}

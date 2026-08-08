"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// labeled: نسخة موسّعة للإعدادات (نص + سويتش) بدل الأيقونة المجرّدة المستخدمة سابقاً بالهيدر
export default function ThemeToggle({ labeled = false }: { labeled?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  if (labeled) {
    return (
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5"
      >
        <span className="flex items-center gap-3">
          {isDark ? <Moon size={18} className="text-[#6D28D9]" /> : <Sun size={18} className="text-[#6D28D9]" />}
          <span className="text-sm font-medium text-gray-900">الوضع الليلي</span>
        </span>
        <span
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isDark ? "bg-[#6D28D9]" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isDark ? "translate-x-[-1.375rem]" : "translate-x-[-0.125rem]"
            } right-0`}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-500 hover:text-[#6D28D9] transition-colors"
      aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

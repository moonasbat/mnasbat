"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";

// شريط التصنيفات الرئيسية — كل أيقونة رابط عادي ينقل لصفحة ذلك التصنيف
// (تحققنا من حراج فعلياً: لا يوجد قائمة منسدلة عند الضغط، الانتقال مباشر لصفحة التصنيف
// والتصنيفات الفرعية تظهر هناك مباشرة بنفس الصفحة بدون نقرة إضافية)
export default function CategoryBar({ categories, activeSlug }: { categories: Category[]; activeSlug?: string | null }) {
  const ref = useRef<HTMLElement>(null);

  // يقيس ارتفاعه الفعلي ويعرّضه كمتغيّر CSS ليتموضع أي شريط لاصق أسفله (شريط التصنيفات الفرعية) دون تراكب
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--category-bar-h", `${el.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--category-bar-h", "0px");
    };
  }, []);

  return (
    <section
      ref={ref}
      style={{ top: "var(--header-h, 64px)" }}
      className="sticky z-30 bg-white border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/"
            className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-colors ${
              !activeSlug ? "border-[#6D28D9] bg-purple-50" : "border-transparent hover:bg-purple-50"
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span className={`text-xs whitespace-nowrap ${!activeSlug ? "text-[#6D28D9] font-medium" : "text-gray-500"}`}>الرئيسية</span>
          </Link>
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-colors ${
                  active ? "border-[#6D28D9] bg-purple-50" : "border-transparent hover:bg-purple-50"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs whitespace-nowrap ${active ? "text-[#6D28D9] font-medium" : "text-gray-500"}`}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

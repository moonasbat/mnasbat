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
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        {/* جوال: شبكة صفّين تُمرَّر أفقياً (نفس كثافة حراج) بدل صف واحد طويل */}
        <div className="md:hidden grid grid-rows-2 grid-flow-col auto-cols-[64px] gap-x-1 gap-y-1 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
          <Link
            href="/"
            className={`snap-start flex flex-col items-center gap-0.5 py-1.5 rounded-lg ${!activeSlug ? "text-[#6D28D9]" : "text-gray-600"}`}
          >
            <span className={`text-xl w-9 h-9 flex items-center justify-center rounded-full ${!activeSlug ? "bg-purple-50" : "bg-gray-50"}`}>🏠</span>
            <span className="text-[10px] whitespace-nowrap font-medium">الرئيسية</span>
          </Link>
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className={`snap-start flex flex-col items-center gap-0.5 py-1.5 rounded-lg ${active ? "text-[#6D28D9]" : "text-gray-600"}`}
              >
                <span className={`text-xl w-9 h-9 flex items-center justify-center rounded-full ${active ? "bg-purple-50" : "bg-gray-50"}`}>{cat.icon}</span>
                <span className="text-[10px] whitespace-nowrap font-medium truncate max-w-[60px]">{cat.name}</span>
              </Link>
            );
          })}
        </div>

        {/* سطح المكتب: صف أفقي واحد كما كان */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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

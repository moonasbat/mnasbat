import Link from "next/link";
import { Category } from "@/lib/types";

// شريط التصنيفات الرئيسية — كل أيقونة رابط عادي ينقل لصفحة ذلك التصنيف
// (تحققنا من حراج فعلياً: لا يوجد قائمة منسدلة عند الضغط، الانتقال مباشر لصفحة التصنيف
// والتصنيفات الفرعية تظهر هناك مباشرة بنفس الصفحة بدون نقرة إضافية)
export default function CategoryBar({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/"
            className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">الرئيسية</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

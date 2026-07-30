import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import CategoryBar from "@/components/CategoryBar";
import LocationFilters from "@/components/LocationFilters";
import { Ad, Category, Profile } from "@/lib/types";
import { SEARCH_CONTENT } from "@/lib/content";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sub?: string; city?: string; featured?: string; sort?: string; page?: string }>;
}) {
  const { q, category: categorySlug, sub: subSlug, city, featured, sort, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: allCategories }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : { data: null },
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const categories = allCategories as Category[];
  const mainCategories = categories.filter((c) => !c.parent_id);
  const mainCategory = categorySlug ? categories.find((c) => c.slug === categorySlug && !c.parent_id) : undefined;
  const subcategories = mainCategory ? categories.filter((c) => c.parent_id === mainCategory.id) : [];
  const subCategory = subSlug ? subcategories.find((c) => c.slug === subSlug) : undefined;

  let query = supabase
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)", { count: "exact" })
    .eq("status", "published");

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (subCategory) {
    query = query.eq("category_id", subCategory.id);
  } else if (mainCategory) {
    const ids = [mainCategory.id, ...subcategories.map((c) => c.id)];
    query = query.in("category_id", ids);
  }
  if (city) query = query.eq("city", city);
  if (featured === "true") query = query.eq("is_featured", true);

  if (sort === "featured") {
    query = query.order("is_featured", { ascending: false }).order("published_at", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: ads, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorySlug) params.set("category", categorySlug);
    if (subSlug) params.set("sub", subSlug);
    if (city) params.set("city", city);
    if (featured) params.set("featured", featured);
    if (sort) params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      {/* شريط التصنيفات الكامل — ثابت في كل صفحات التصفح، يختفي فقط داخل صفحة الإعلان المفردة */}
      <CategoryBar categories={mainCategories} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {mainCategory && (
          <div className="mb-5 space-y-3">
            <h1 className="text-lg font-bold text-gray-900">{mainCategory.name}</h1>
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/search?category=${mainCategory.slug}`}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    !subCategory ? "bg-[#6D28D9] border-[#6D28D9] text-white" : "border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9]"
                  }`}
                >
                  الكل
                </Link>
                {subcategories.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/search?category=${mainCategory.slug}&sub=${sc.slug}`}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      subCategory?.id === sc.id ? "bg-[#6D28D9] border-[#6D28D9] text-white" : "border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    }`}
                  >
                    {sc.name}
                  </Link>
                ))}
              </div>
            )}
            <LocationFilters />
          </div>
        )}
        {!mainCategory && (
          <div className="mb-5">
            <LocationFilters />
          </div>
        )}

        <form className="flex flex-wrap gap-2 mb-4">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          {subSlug && <input type="hidden" name="sub" value={subSlug} />}
          {city && <input type="hidden" name="city" value={city} />}
          <input type="text" name="q" defaultValue={q} placeholder="ابحث..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px]" />
          <select name="sort" defaultValue={sort ?? ""} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">{SEARCH_CONTENT.sortLatest}</option>
            <option value="featured">{SEARCH_CONTENT.sortFeatured}</option>
          </select>
          <button className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium">{SEARCH_CONTENT.apply}</button>
        </form>

        {count !== null && count > 0 && (
          <p className="text-xs text-gray-400 mb-4">{count} نتيجة</p>
        )}

        {ads && ads.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(ads as Ad[]).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:border-[#6D28D9] hover:text-[#6D28D9]">
                    <ChevronRight size={16} />
                    السابق
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-300 border border-gray-100 rounded-xl px-4 py-2">
                    <ChevronRight size={16} />
                    السابق
                  </span>
                )}
                <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)} className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:border-[#6D28D9] hover:text-[#6D28D9]">
                    التالي
                    <ChevronLeft size={16} />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-300 border border-gray-100 rounded-xl px-4 py-2">
                    التالي
                    <ChevronLeft size={16} />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">{SEARCH_CONTENT.noResults}</p>
            <p className="text-sm mt-1">{SEARCH_CONTENT.noResultsBody}</p>
            <Link href="/search" className="inline-flex items-center gap-1 mt-4 text-sm text-[#6D28D9] hover:underline">
              مسح الفلاتر
              <ChevronLeft size={14} />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

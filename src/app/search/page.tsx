import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import BackButton from "@/components/BackButton";
import LocationFilters from "@/components/LocationFilters";
import { Ad, Category, Profile } from "@/lib/types";
import { SEARCH_CONTENT } from "@/lib/content";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sub?: string; city?: string; featured?: string; sort?: string }>;
}) {
  const { q, category: categorySlug, sub: subSlug, city, featured, sort } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: allCategories }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : { data: null },
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const categories = allCategories as Category[];
  const mainCategory = categorySlug ? categories.find((c) => c.slug === categorySlug && !c.parent_id) : undefined;
  const subcategories = mainCategory ? categories.filter((c) => c.parent_id === mainCategory.id) : [];
  const subCategory = subSlug ? subcategories.find((c) => c.slug === subSlug) : undefined;

  let query = supabase
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)")
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

  const { data: ads } = await query.limit(48);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Breadcrumb مضغوط بدل شريط التصنيفات الكامل */}
        <div className="flex items-center gap-3 mb-3">
          <BackButton />
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 overflow-x-auto scrollbar-none">
            <Link href="/" className="hover:text-[#6D28D9] shrink-0">الرئيسية</Link>
            <span className="shrink-0">/</span>
            {mainCategory ? (
              <Link href={`/search?category=${mainCategory.slug}`} className={`shrink-0 hover:text-[#6D28D9] ${!subCategory ? "text-gray-900 font-medium" : ""}`}>
                {mainCategory.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium shrink-0">كل المناسبات</span>
            )}
            {subCategory && (
              <>
                <span className="shrink-0">/</span>
                <span className="text-gray-900 font-medium shrink-0">{subCategory.name}</span>
              </>
            )}
          </nav>
        </div>

        {/* تصنيفات فرعية نصية + فلاتر الموقع */}
        {mainCategory && !subCategory && (
          <div className="mb-5 space-y-3">
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sc) => (
                  <Link
                    key={sc.id}
                    href={`/search?category=${mainCategory.slug}&sub=${sc.slug}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors"
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

        <form className="flex flex-wrap gap-2 mb-6">
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

        {ads && ads.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(ads as Ad[]).map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
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

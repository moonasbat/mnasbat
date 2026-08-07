import { createPublicClient } from "@/lib/supabase/public";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import CategoryBar from "@/components/CategoryBar";
import LocationFilters from "@/components/LocationFilters";
import { Ad, Category } from "@/lib/types";
import { SEARCH_CONTENT } from "@/lib/content";
import { getSiteFlags, getSiteSettings } from "@/lib/siteConfig";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { SITE_NAME, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { adUrl } from "@/lib/adSlug";

const PAGE_SIZE = 24;

type SearchParams = { q?: string; category?: string; sub?: string; city?: string; featured?: string; sort?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { q, category: categorySlug, sub: subSlug, city, page: pageParam } = await searchParams;
  const supabase = createPublicClient();

  let title = "البحث";
  let description = "تصفح إعلانات المناسبات — قاعات، تصوير، ضيافة، ديكور، وأكثر.";

  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("name").eq("slug", subSlug || categorySlug).maybeSingle();
    if (cat) {
      title = cat.name;
      description = `تصفح كل إعلانات ${cat.name}${city ? ` في ${city}` : ""} على مناسبات.`;
    }
  } else if (q) {
    title = `نتائج البحث عن "${q}"`;
    description = `نتائج البحث عن "${q}" في إعلانات المناسبات.`;
  } else if (city) {
    title = `إعلانات المناسبات في ${city}`;
    description = `تصفح كل إعلانات خدمات المناسبات في ${city}.`;
  }

  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (subSlug) params.set("sub", subSlug);
  const qs = params.toString();

  // الصفحة الأولى فقط تُفهرس — بقية الصفحات (?page=2 وما بعدها) نفس المحتوى تقريباً، فهرستها تسبب محتوى مكرر
  const isPaginated = Number(pageParam) > 1;

  return {
    title,
    description,
    alternates: { canonical: `/search${qs ? `?${qs}` : ""}` },
    openGraph: { title, description },
    robots: isPaginated ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sub?: string; city?: string; featured?: string; sort?: string; page?: string }>;
}) {
  const { q, category: categorySlug, sub: subSlug, city, featured, sort, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = createPublicClient();

  const [{ data: allCategories }, flags, settings] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    getSiteFlags(supabase),
    getSiteSettings(supabase),
  ]);
  const cityFilterEnabled = flags.city_filter_enabled !== false;
  const trendingEnabled = flags.trending_badge_enabled !== false;
  const trendingThreshold = Number(settings.trending_views_threshold) || 50;

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
  if (city && cityFilterEnabled) query = query.eq("city", city);
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

  const breadcrumbItems = [
    { name: SITE_NAME, path: "/" },
    mainCategory && { name: mainCategory.name, path: `/search?category=${mainCategory.slug}` },
    subCategory && { name: subCategory.name, path: `/search?category=${mainCategory?.slug}&sub=${subCategory.slug}` },
  ].filter(Boolean) as { name: string; path: string }[];

  const listJsonLd = ads && ads.length > 0
    ? itemListJsonLd((ads as Ad[]).map((a) => ({ name: a.title, path: adUrl(a) })))
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }} />
      {listJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />}
      <Header />

      {/* شريط التصنيفات الرئيسية — ثابت في كل صفحات التصفح، يختفي فقط داخل صفحة الإعلان المفردة */}
      <CategoryBar categories={mainCategories} activeSlug={categorySlug} />

      {/* شريط التصنيفات الفرعية — ثابت أيضاً أسفل شريط التصنيفات الرئيسية مباشرة */}
      {mainCategory && subcategories.length > 0 && (
        <section
          style={{ top: "calc(var(--header-h, 64px) + var(--category-bar-h, 0px))" }}
          className="sticky z-20 bg-white border-b border-gray-100 min-w-0"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none min-w-0">
              <Link
                href={`/search?category=${mainCategory.slug}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  !subCategory ? "bg-[#6D28D9] border-[#6D28D9] text-white" : "border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9]"
                }`}
              >
                الكل
              </Link>
              {subcategories.map((sc) => (
                <Link
                  key={sc.id}
                  href={`/search?category=${mainCategory.slug}&sub=${sc.slug}`}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    subCategory?.id === sc.id ? "bg-[#6D28D9] border-[#6D28D9] text-white" : "border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9]"
                  }`}
                >
                  {sc.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 min-w-0">
        {mainCategory && (
          <div className="mb-5 space-y-3">
            <h1 className="text-lg font-bold text-gray-900">{mainCategory.name}</h1>
            {cityFilterEnabled && <LocationFilters />}
          </div>
        )}
        {!mainCategory && cityFilterEnabled && (
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
                <AdCard key={ad.id} ad={ad} trendingEnabled={trendingEnabled} trendingThreshold={trendingThreshold} />
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

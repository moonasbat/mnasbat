import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import { Ad, Category, Profile } from "@/lib/types";
import { SEARCH_CONTENT } from "@/lib/content";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; featured?: string; sort?: string }>;
}) {
  const { q, category, featured, sort } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: categories }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : { data: null },
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  let query = supabase
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)")
    .eq("status", "published");

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) {
    const cat = (categories as Category[])?.find((c) => c.slug === category);
    if (cat) query = query.eq("category_id", cat.id);
  }
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-4">{SEARCH_CONTENT.resultsTitle}</h1>

        <form className="flex flex-wrap gap-2 mb-6">
          <input type="text" name="q" defaultValue={q} placeholder="ابحث..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px]" />
          <select name="category" defaultValue={category ?? ""} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">{SEARCH_CONTENT.allCategories}</option>
            {(categories as Category[])?.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

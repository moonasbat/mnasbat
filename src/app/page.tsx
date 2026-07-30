import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import Link from "next/link";
import { Ad, Category, Profile } from "@/lib/types";
import { HOME_CONTENT } from "@/lib/content";
import { Plus, ChevronLeft, Search } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: categories },
    { data: featuredAds },
    { data: latestAds },
  ] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : { data: null },
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase
      .from("ads")
      .select("*, profiles(*), categories(*), ad_images(*)")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("ads")
      .select("*, profiles(*), categories(*), ad_images(*)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1">
        <section className="bg-gradient-to-bl from-[#6D28D9] to-[#8B5CF6] text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{HOME_CONTENT.title}</h1>
            <p className="text-purple-100 mb-8 text-lg">{HOME_CONTENT.description}</p>

            <form action="/search" className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="q"
                  placeholder={HOME_CONTENT.searchPlaceholder}
                  className="w-full rounded-xl px-10 py-3 text-gray-900 text-sm focus:outline-none"
                />
              </div>
              <button className="bg-white text-[#6D28D9] font-bold px-5 py-3 rounded-xl hover:bg-purple-50 transition-colors">
                {HOME_CONTENT.searchButton}
              </button>
            </form>

            <Link
              href="/ads/new"
              className="inline-flex items-center gap-2 mt-6 bg-white/10 border border-white/30 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Plus size={18} />
              {HOME_CONTENT.addAdButton}
            </Link>
          </div>
        </section>

        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href="/search"
                className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl">🗂️</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{HOME_CONTENT.browseAds}</span>
              </Link>
              {(categories as Category[])?.map((cat) => (
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

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
          {featuredAds && featuredAds.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{HOME_CONTENT.featuredAds}</h2>
                <Link href="/search?featured=true" className="flex items-center gap-1 text-sm text-[#6D28D9] hover:underline">
                  عرض الكل
                  <ChevronLeft size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(featuredAds as Ad[]).map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{HOME_CONTENT.latestAds}</h2>
              <Link href="/search" className="flex items-center gap-1 text-sm text-[#6D28D9] hover:underline">
                عرض الكل
                <ChevronLeft size={16} />
              </Link>
            </div>

            {latestAds && latestAds.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(latestAds as Ad[]).map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">📢</p>
                <p className="font-medium">لا توجد نتائج مطابقة.</p>
                <Link
                  href="/ads/new"
                  className="inline-flex items-center gap-2 mt-4 bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5B21B6] transition-colors"
                >
                  <Plus size={16} />
                  {HOME_CONTENT.addAdButton}
                </Link>
              </div>
            )}
          </section>

          <section className="bg-purple-50 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">{HOME_CONTENT.ctaTitle}</h2>
            <p className="text-gray-500 mt-2">{HOME_CONTENT.ctaBody}</p>
            <Link
              href="/ads/new"
              className="inline-flex items-center gap-2 mt-5 bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#5B21B6] transition-colors"
            >
              <Plus size={18} />
              {HOME_CONTENT.ctaButton}
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

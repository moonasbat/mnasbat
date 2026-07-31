import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Ad, Profile } from "@/lib/types";
import { SEARCH_CONTENT } from "@/lib/content";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const { data: favorites } = user
    ? await supabase.from("favorites").select("ads(*, profiles(*), categories(*), ad_images(*))").eq("user_id", user.id).order("created_at", { ascending: false })
    : { data: [] };

  const ads = (favorites ?? []).map((f) => f.ads).filter(Boolean) as unknown as Ad[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className={`flex-1 max-w-6xl mx-auto w-full px-4 py-8 min-w-0 ${user ? "grid md:grid-cols-[220px_1fr] gap-8 items-start" : ""}`}>
        {user && (
          <div className="min-w-0 md:sticky md:top-20">
            <DashboardNav />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 mb-6">المفضلة</h1>
          {ads.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">🤍</p>
              <p className="font-medium">{SEARCH_CONTENT.noFavorites}</p>
              <p className="text-sm mt-1">{SEARCH_CONTENT.noFavoritesBody}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

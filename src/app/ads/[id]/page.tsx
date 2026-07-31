import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactPanel from "@/components/ads/ContactPanel";
import CommentsSection from "@/components/ads/CommentsSection";
import ReportDialog from "@/components/ReportDialog";
import AdCard from "@/components/ads/AdCard";
import { Ad, AdImage, Profile, Comment } from "@/lib/types";
import { AD_PAGE_CONTENT } from "@/lib/content";
import { formatRelativeTime, formatNumber } from "@/lib/formatTime";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import BackButton from "@/components/BackButton";
import AdGallery from "@/components/ads/AdGallery";

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ad } = await supabase
    .from("ads")
    .select("*, profiles(*), categories(*), ad_images(*)")
    .eq("id", id)
    .single();

  if (!ad) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">{AD_PAGE_CONTENT.noLongerAvailable}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (ad.status !== "published" && ad.user_id !== user?.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">{AD_PAGE_CONTENT.noLongerAvailable}</p>
        </main>
        <Footer />
      </div>
    );
  }

  await supabase.rpc("increment_ad_views", { ad_id_param: id });

  const [{ data: profile }, { data: comments }, { data: favorite }, { data: sellerAds }, { data: parentCategory }, { data: similarAds }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("comments").select("*, profiles(*)").eq("ad_id", id).eq("status", "visible").order("created_at", { ascending: false }),
    user ? supabase.from("favorites").select("id").eq("ad_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("ads").select("*, profiles(*), categories(*), ad_images(*)").eq("user_id", ad.user_id).eq("status", "published").neq("id", id).limit(4),
    ad.categories?.parent_id
      ? supabase.from("categories").select("*").eq("id", ad.categories.parent_id).single()
      : Promise.resolve({ data: null }),
    // إعلانات مشابهة — نفس التصنيف من معلنين آخرين (مثل "عروض مشابهة" في مواقع الإعلانات المبوبة)
    supabase
      .from("ads")
      .select("*, profiles(*), categories(*), ad_images(*)")
      .eq("category_id", ad.category_id)
      .eq("status", "published")
      .neq("id", id)
      .neq("user_id", ad.user_id)
      .order("published_at", { ascending: false })
      .limit(8),
  ]);

  const images: AdImage[] = (ad.ad_images ?? []).sort((a: AdImage, b: AdImage) => a.sort_order - b.sort_order);
  const seller = ad.profiles as Profile;
  const mainCategory = parentCategory ?? ad.categories;
  const subCategory = parentCategory ? ad.categories : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <BackButton />
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 overflow-x-auto scrollbar-none">
            <Link href="/" className="hover:text-[#6D28D9] shrink-0">الرئيسية</Link>
            {mainCategory && (
              <>
                <span className="shrink-0">/</span>
                <Link href={`/search?category=${mainCategory.slug}`} className="hover:text-[#6D28D9] shrink-0">
                  {mainCategory.name}
                </Link>
              </>
            )}
            {subCategory && (
              <>
                <span className="shrink-0">/</span>
                <Link href={`/search?category=${mainCategory.slug}&sub=${subCategory.slug}`} className="hover:text-[#6D28D9] shrink-0">
                  {subCategory.name}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* الصور والعنوان والوصف — يظهرون أولاً دائماً */}
          <div className="md:col-span-2 md:order-1 space-y-6">
            <AdGallery images={images} title={ad.title} />

            <div>
              <span className="text-xs text-[#6D28D9] bg-purple-50 rounded-lg px-2 py-1">{ad.categories?.name}</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3">{ad.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                {ad.city && <span>{ad.city}</span>}
                <span>{formatRelativeTime(ad.published_at ?? ad.created_at)}</span>
              </div>
              {ad.price ? (
                <p className="text-xl font-bold text-[#6D28D9] mt-3">{formatNumber(ad.price)} ر.س</p>
              ) : (
                <p className="text-sm text-gray-400 mt-3">حسب الاتفاق</p>
              )}
              <p className="text-gray-700 mt-4 whitespace-pre-line leading-relaxed">{ad.description}</p>
            </div>
          </div>

          {/* المعلن وأزرار التواصل — تظهر مباشرة بعد وصف الإعلان وقبل التعليقات على الجوال */}
          <div className="md:order-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <Link href={`/profile/${seller.id}`} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold shrink-0">
                  {seller.avatar_url ? (
                    <Image src={seller.avatar_url} alt={seller.display_name} width={44} height={44} className="rounded-full object-cover" />
                  ) : (
                    seller.display_name?.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{seller.display_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    {seller.positive_reviews} تقييم إيجابي
                  </div>
                </div>
              </Link>
            </div>

            <ContactPanel
              adId={ad.id}
              adTitle={ad.title}
              whatsapp={ad.whatsapp}
              messagesEnabled={ad.messages_enabled}
              isLoggedIn={!!user}
              initialFavorited={!!favorite}
            />

            <div className="text-center">
              <ReportDialog targetType="ad" targetId={ad.id} label={AD_PAGE_CONTENT.reportAd} />
            </div>
          </div>

          {/* التعليقات — تظهر أخيراً */}
          <div className="md:col-span-2 md:order-3">
            <CommentsSection
              adId={ad.id}
              initialComments={(comments ?? []) as Comment[]}
              enabled={ad.comments_enabled}
              isLoggedIn={!!user}
              currentUserId={user?.id}
            />
          </div>
        </div>

        {similarAds && similarAds.length > 0 && (
          <section className="mt-12">
            <h2 className="font-bold text-gray-900 mb-4">إعلانات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(similarAds as Ad[]).map((a) => (
                <AdCard key={a.id} ad={a} />
              ))}
            </div>
          </section>
        )}

        {sellerAds && sellerAds.length > 0 && (
          <section className="mt-12">
            <h2 className="font-bold text-gray-900 mb-4">إعلانات أخرى لنفس المعلن</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(sellerAds as Ad[]).map((a) => (
                <AdCard key={a.id} ad={a} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

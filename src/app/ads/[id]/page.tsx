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
import BackButton from "@/components/BackButton";
import AdGallery from "@/components/ads/AdGallery";
import { getSiteFlags } from "@/lib/siteConfig";
import { isUuid, adUrl } from "@/lib/adSlug";
import { profileUrl } from "@/lib/profileUrl";
import { StarRatingDisplay } from "@/components/StarRating";
import { averageRating } from "@/lib/rating";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

// Next.js لا يضمن دائماً فك ترميز params في مكوّن الصفحة (بخلاف generateMetadata) —
// نفك الترميز يدوياً لأن الرابط يحتوي نصاً عربياً (slug) قد يصل بصيغته المُرمّزة (%D9%81...)
function decodeParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

async function findAdByParam(supabase: Awaited<ReturnType<typeof createClient>>, rawParam: string, columns: string): Promise<Record<string, any> | null> {
  const param = decodeParam(rawParam);
  const bySlug = await supabase.from("ads").select(columns).eq("slug", param).maybeSingle();
  if (bySlug.data) return bySlug.data;
  if (isUuid(param)) {
    const byId = await supabase.from("ads").select(columns).eq("id", param).maybeSingle();
    if (byId.data) return byId.data;
  }
  return null;
}

// عنوان/وصف/صورة مخصصة لكل إعلان عند مشاركة الرابط (واتساب، تويتر، إلخ) بدل عنوان الصفحة الرئيسية العام
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: param } = await params;
  const supabase = await createClient();
  const ad = await findAdByParam(supabase, param, "slug, title, description, price, city, ad_images(url, sort_order)");

  if (!ad) return { title: "الإعلان غير متاح" };

  const title = ad.title;
  const description = ad.description?.slice(0, 160) || "اكتشف هذا الإعلان على منصة مناسبات.";
  const images = (ad.ad_images as { url: string; sort_order: number }[] | null) ?? [];
  const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const canonicalPath = adUrl({ id: param, slug: (ad.slug as string | null) ?? null });

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: "ar_SA",
      url: canonicalPath,
      images: firstImage ? [{ url: firstImage, width: 1200, height: 900 }] : undefined,
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: param } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ad = await findAdByParam(supabase, param, "*, profiles(*), categories(*), ad_images(*)");

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

  const id = ad.id as string;
  await supabase.rpc("increment_ad_views", { ad_id_param: id });

  const [{ data: profile }, { data: comments }, { data: favorite }, { data: sellerAds }, { data: parentCategory }, { data: similarAds }, flags] = await Promise.all([
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
    getSiteFlags(supabase),
  ]);

  const images: AdImage[] = (ad.ad_images ?? []).sort((a: AdImage, b: AdImage) => a.sort_order - b.sort_order);
  const seller = ad.profiles as Profile;
  const mainCategory = parentCategory ?? ad.categories;
  const subCategory = parentCategory ? ad.categories : null;
  const whatsappEnabled = flags.whatsapp_enabled !== false;
  const favoritesEnabled = flags.favorites_enabled !== false;

  const canonicalPath = adUrl({ id, slug: ad.slug as string | null | undefined });
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ad.title,
    description: ad.description,
    image: images.map((img) => img.url),
    category: subCategory?.name ?? mainCategory?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${canonicalPath}`,
      priceCurrency: "SAR",
      price: ad.price ?? undefined,
      availability: "https://schema.org/InStock",
      areaServed: ad.city ?? undefined,
      seller: { "@type": "Person", name: seller?.display_name },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      mainCategory && { "@type": "ListItem", position: 2, name: mainCategory.name, item: `${SITE_URL}/search?category=${mainCategory.slug}` },
      subCategory && { "@type": "ListItem", position: 3, name: subCategory.name, item: `${SITE_URL}/search?category=${mainCategory?.slug}&sub=${subCategory.slug}` },
      { "@type": "ListItem", position: subCategory ? 4 : 3, name: ad.title, item: `${SITE_URL}${canonicalPath}` },
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
              {ad.edited_at && (
                <p className="text-xs text-gray-400 mt-3">تم تعديل هذا الإعلان بتاريخ {formatRelativeTime(ad.edited_at)}</p>
              )}
            </div>
          </div>

          {/* المعلن وأزرار التواصل — تظهر مباشرة بعد وصف الإعلان وقبل التعليقات على الجوال */}
          <div className="md:order-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <Link href={profileUrl(seller)} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold shrink-0">
                  {seller.avatar_url ? (
                    <Image src={seller.avatar_url} alt={seller.display_name} width={44} height={44} className="rounded-full object-cover" />
                  ) : (
                    seller.display_name?.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{seller.display_name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {seller.total_reviews > 0 ? (
                      <>
                        <StarRatingDisplay value={averageRating(seller)} size={12} />
                        <span>{averageRating(seller).toFixed(1)} ({seller.total_reviews})</span>
                      </>
                    ) : (
                      <span>لا توجد تقييمات بعد</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            <ContactPanel
              adId={ad.id}
              adTitle={ad.title}
              whatsapp={whatsappEnabled ? ad.whatsapp : undefined}
              messagesEnabled={ad.messages_enabled}
              isLoggedIn={!!user}
              initialFavorited={!!favorite}
              favoritesEnabled={favoritesEnabled}
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

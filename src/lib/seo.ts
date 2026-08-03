// ثوابت السيو المشتركة — مصدر واحد لاسم الموقع والرابط الأساسي يُستخدم في كل generateMetadata والبيانات الهيكلية (JSON-LD)
export const SITE_NAME = "مناسبات";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://moonasbat.com";
export const SITE_DESCRIPTION = "سوق إعلانات متخصص بكل ما يخص المناسبات في السعودية — قاعات، تصوير، ضيافة، ديكور، وأكثر.";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// بيانات هيكلية مشتركة (JSON-LD) — تُستخدم في أكثر من صفحة عشان ما نكرر نفس الشكل بكل مكان

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// نضيف aggregateRating فقط لو فيه تقييمات فعلية — قوقل يعاقب أي بيانات هيكلية بقيم وهمية أو صفرية
export function aggregateRatingJsonLd(profile: { rating_sum: number; total_reviews: number }) {
  if (!profile.total_reviews) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: (profile.rating_sum / profile.total_reviews).toFixed(1),
    reviewCount: profile.total_reviews,
    bestRating: 5,
    worstRating: 1,
  };
}

export function personJsonLd(profile: { display_name: string; bio?: string | null; avatar_url?: string | null; rating_sum: number; total_reviews: number }, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name,
    description: profile.bio ?? undefined,
    image: profile.avatar_url ?? undefined,
    url: absoluteUrl(path),
    aggregateRating: aggregateRatingJsonLd(profile),
  };
}

export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

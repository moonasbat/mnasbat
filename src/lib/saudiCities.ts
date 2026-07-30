export const SAUDI_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.4858, lng: 39.1925 },
  { name: "مكة المكرمة", lat: 21.3891, lng: 39.8579 },
  { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692 },
  { name: "الدمام", lat: 26.4207, lng: 50.0888 },
  { name: "الخبر", lat: 26.2172, lng: 50.1971 },
  { name: "الطائف", lat: 21.2703, lng: 40.4158 },
  { name: "تبوك", lat: 28.3998, lng: 36.5715 },
  { name: "بريدة", lat: 26.326, lng: 43.975 },
  { name: "حائل", lat: 27.5114, lng: 41.69 },
  { name: "أبها", lat: 18.2164, lng: 42.5053 },
  { name: "خميس مشيط", lat: 18.3, lng: 42.7333 },
  { name: "جازان", lat: 16.8892, lng: 42.5611 },
  { name: "نجران", lat: 17.4933, lng: 44.1277 },
];

function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestSaudiCity(lat: number, lng: number): string {
  let closest = SAUDI_CITIES[0];
  let minDist = Infinity;
  for (const city of SAUDI_CITIES) {
    const d = distance(lat, lng, city.lat, city.lng);
    if (d < minDist) {
      minDist = d;
      closest = city;
    }
  }
  return closest.name;
}

// خرائط كلمات مفتاحية بسيطة لاقتراح التصنيف تلقائياً من العنوان
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "halls": ["قاعة", "قاعات", "استراحة", "استراحات", "قصر أفراح", "شاليه"],
  "planning": ["تنظيم", "تنسيق مناسبة", "منسق", "وردينر", "wedding planner"],
  "photography": ["تصوير", "مصور", "كاميرا", "فيديو", "درون", "بوث تصوير"],
  "catering": ["ضيافة", "كاترينج", "بوفيه", "قهوجي", "صبابة", "شيف"],
  "decoration": ["ديكور", "تنسيق طاولات", "إضاءة", "ليزر", "خيام", "شاشات"],
  "flowers": ["زهور", "ورد", "هدايا", "بوكيه"],
  "weddings": ["كوشة", "كوش", "عرس", "زفاف", "عروس", "عريس"],
  "sound-light": ["صوت", "إضاءة", "دي جي", "DJ", "مايك", "سماعات"],
  "fashion": ["عباية", "بدلة", "أزياء", "خياطة", "إطلالة"],
  "invitations": ["دعوة", "دعوات", "بطاقة", "بطاقات شكر", "بانر"],
  "sweets": ["كيك", "حلويات", "كاندي بار", "بوفيه حلا"],
  "supplies": ["مستلزمات", "توزيعات", "بالونات"],
  "kids-entertainment": ["أطفال", "ترفيه", "العاب", "مهرج", "رسام"],
};

export function suggestCategorySlug(title: string): string | null {
  const normalized = title.trim();
  if (!normalized) return null;
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => normalized.includes(k))) return slug;
  }
  return null;
}

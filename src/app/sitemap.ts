import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { adUrl } from "@/lib/adSlug";

export const revalidate = 3600; // إعادة توليد الخريطة كل ساعة بدل توليدها من الصفر بكل زيارة

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://moonasbat.com";
  const admin = createAdminClient();

  const [{ data: ads }, { data: categories }, { data: pages }, { data: profiles }] = await Promise.all([
    admin.from("ads").select("id, slug, updated_at").eq("status", "published").order("published_at", { ascending: false }).limit(5000),
    admin.from("categories").select("slug, parent_id").eq("is_active", true),
    admin.from("static_pages").select("slug, updated_at"),
    admin.from("profiles").select("id, username, updated_at").eq("is_banned", false).limit(2000),
  ]);

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  // كل التصنيفات (رئيسية وفرعية) — الفرعية أهم فعلياً لأنها الأقرب لنية بحث المستخدم
  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: encodeURI(`${base}/search?category=${c.slug}`),
    changeFrequency: "daily",
    priority: c.parent_id ? 0.6 : 0.7,
  }));

  const pageEntries: MetadataRoute.Sitemap = (pages ?? []).map((p) => ({
    url: encodeURI(`${base}/pages/${p.slug}`),
    lastModified: p.updated_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  const profileEntries: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: encodeURI(`${base}${p.username ? `/profile/@${p.username}` : `/profile/${p.id}`}`),
    lastModified: p.updated_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  // الرابط بالفعل يحتوي حروف عربية (slug الإعلان) — لازم ترميزه صراحة، خريطة الموقع لا تقبل حروف غير ASCII خامة
  const adEntries: MetadataRoute.Sitemap = (ads ?? []).map((ad) => ({
    url: encodeURI(`${base}${adUrl(ad)}`),
    lastModified: ad.updated_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...pageEntries, ...profileEntries, ...adEntries];
}

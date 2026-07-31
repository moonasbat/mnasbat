import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { adUrl } from "@/lib/adSlug";

export const revalidate = 3600; // إعادة توليد الخريطة كل ساعة بدل توليدها من الصفر بكل زيارة

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://mnasbat.vercel.app";
  const admin = createAdminClient();

  const [{ data: ads }, { data: categories }, { data: pages }] = await Promise.all([
    admin.from("ads").select("id, slug, updated_at").eq("status", "published").order("published_at", { ascending: false }).limit(5000),
    admin.from("categories").select("slug").eq("is_active", true).is("parent_id", null),
    admin.from("static_pages").select("slug, updated_at"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/help`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${base}/search?category=${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const pageEntries: MetadataRoute.Sitemap = (pages ?? []).map((p) => ({
    url: `${base}/pages/${p.slug}`,
    lastModified: p.updated_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  const adEntries: MetadataRoute.Sitemap = (ads ?? []).map((ad) => ({
    url: `${base}${adUrl(ad)}`,
    lastModified: ad.updated_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...pageEntries, ...adEntries];
}

import { createPublicClient } from "@/lib/supabase/public";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { StaticPage } from "@/lib/types";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: page } = await supabase.from("static_pages").select("title, content").eq("slug", slug).maybeSingle();
  if (!page) return { title: "الصفحة غير متاحة" };

  const plainText = page.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const description = plainText.slice(0, 160) || `${page.title} — منصة مناسبات.`;

  // صفحات السياسات والاتفاقيات القانونية ما فيها أي طلب بحث فعلي — نستثنيها من الفهرسة
  // حتى ما تزاحم صفحات الإعلانات والتصنيفات الفعلية بنتائج قوقل. الأسئلة الشائعة تبقى مفهرسة لأنها محتوى بحثي مفيد.
  const isLegalPage = slug !== "faq";

  return {
    title: page.title,
    description,
    alternates: { canonical: `/pages/${slug}` },
    openGraph: { title: page.title, description },
    robots: isLegalPage ? { index: false, follow: true } : undefined,
  };
}

export default async function StaticPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: page } = await supabase.from("static_pages").select("*").eq("slug", slug).single();
  if (!page) notFound();
  const p = page as StaticPage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.content }} />
      </main>
      <Footer />
    </div>
  );
}

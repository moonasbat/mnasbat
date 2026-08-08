import { createPublicClient } from "@/lib/supabase/public";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import PolicyAccordion, { PolicySection } from "@/components/PolicyAccordion";
import { StaticPage } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "السياسات",
  description: "سياسة الخصوصية، المحتوى المسموح، التعليقات والرسائل، التقييمات، والسلامة عند التعامل على منصة مناسبات.",
  alternates: { canonical: "/pages/policies" },
  robots: { index: false, follow: true },
};

// الترتيب المعروض بالصفحة — يعكس أولوية اهتمام الزائر (الخصوصية والمحتوى أولاً، ثم التفاعل، ثم السلامة)
const ORDER = ["privacy", "content-policy", "comments-policy", "review-policy", "safety"];

export default async function PoliciesPage() {
  const supabase = createPublicClient();
  const { data: pages } = await supabase.from("static_pages").select("slug, title, content").in("slug", ORDER);

  const bySlug = new Map((pages as StaticPage[] | null ?? []).map((p) => [p.slug, p]));
  const sections: PolicySection[] = ORDER.map((slug) => bySlug.get(slug))
    .filter((p): p is StaticPage => !!p)
    .map((p) => ({ title: p.title, content: p.content }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-1">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">السياسات</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          كل ما يخص خصوصيتك وحقوقك واستخدامك المسؤول لمنصة مناسبات — اضغط أي بند لعرض تفاصيله.
        </p>
        <PolicyAccordion sections={sections} />
      </main>
      <Footer />
    </div>
  );
}

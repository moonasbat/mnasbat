import { createPublicClient } from "@/lib/supabase/public";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { StaticPage } from "@/lib/types";
import { SAFETY_TIPS } from "@/lib/content";
import { ShieldAlert } from "lucide-react";
import BackButton from "@/components/BackButton";
import FaqAccordion from "@/components/FaqAccordion";
import { parseFaqSections } from "@/lib/faq";
import { safeJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مركز المساعدة",
  description: "إجابات على أكثر الأسئلة تكراراً حول نشر الإعلانات، التواصل مع العملاء، والسلامة عند التعامل على منصة مناسبات.",
  alternates: { canonical: "/help" },
};

export const revalidate = 3600;

export default async function HelpPage() {
  const supabase = createPublicClient();
  const { data: faq } = await supabase.from("static_pages").select("*").eq("slug", "faq").single();

  const faqSections = parseFaqSections((faq as StaticPage)?.content ?? "");
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  return (
    <div className="min-h-screen flex flex-col">
      {faqSections.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      )}
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">مركز المساعدة</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">أسئلة يتكرر سؤالنا عنها — اضغط أي سؤال لعرض الإجابة.</p>

        <div className="mb-10">
          <FaqAccordion sections={faqSections} />
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={18} className="text-amber-600" />
            <h2 className="font-bold text-gray-900">السلامة عند التعامل</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-700 list-disc pr-5">
            {SAFETY_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

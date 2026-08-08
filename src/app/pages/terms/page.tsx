import { createPublicClient } from "@/lib/supabase/public";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import PolicyAccordion from "@/components/PolicyAccordion";
import { parseHtmlSections } from "@/lib/htmlSections";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "اتفاقية استخدام منصة مناسبات — طبيعة الخدمة، التزامات المستخدم، والقانون الواجب التطبيق.",
  alternates: { canonical: "/pages/terms" },
  robots: { index: false, follow: true },
};

export default async function TermsPage() {
  const supabase = createPublicClient();
  const { data: page } = await supabase.from("static_pages").select("content").eq("slug", "terms").single();
  if (!page) notFound();

  const sections = parseHtmlSections(page.content);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-1">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">شروط الاستخدام</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          الاتفاقية التي تحكم استخدامك لمنصة مناسبات — اضغط أي بند لعرض تفاصيله.
        </p>
        <PolicyAccordion sections={sections} />
      </main>
      <Footer />
    </div>
  );
}

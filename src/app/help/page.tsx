import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Profile, StaticPage } from "@/lib/types";
import { SAFETY_TIPS } from "@/lib/content";
import { ShieldAlert } from "lucide-react";
import BackButton from "@/components/BackButton";
import FaqAccordion from "@/components/FaqAccordion";
import { parseFaqSections } from "@/lib/faq";

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: faq }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("static_pages").select("*").eq("slug", "faq").single(),
  ]);

  const faqSections = parseFaqSections((faq as StaticPage)?.content ?? "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
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

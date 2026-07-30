import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Profile, StaticPage } from "@/lib/types";
import { SAFETY_TIPS } from "@/lib/content";
import { ShieldAlert } from "lucide-react";

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: faq }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("static_pages").select("*").eq("slug", "faq").single(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">مركز المساعدة</h1>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: (faq as StaticPage)?.content ?? "" }} />

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

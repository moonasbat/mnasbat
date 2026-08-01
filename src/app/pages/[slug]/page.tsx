import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AdminSettings, Profile, StaticPage } from "@/lib/types";
import { formatGregorianDate } from "@/lib/formatTime";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";

export default async function StaticPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: page }, { data: settingsRows }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("static_pages").select("*").eq("slug", slug).single(),
    slug === "commission-policy" ? supabase.from("admin_settings").select("key,value") : Promise.resolve({ data: [] }),
  ]);

  if (!page) notFound();
  const p = page as StaticPage;

  let liveBlock: React.ReactNode = null;
  if (slug === "commission-policy") {
    const settings: AdminSettings = {};
    (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));
    const rate = Number(settings.commission_rate ?? 5);
    const exemptUntil = settings.commission_exempt_until ? new Date(settings.commission_exempt_until) : null;
    const isExempt = exemptUntil && exemptUntil.getTime() > Date.now();

    liveBlock = isExempt ? (
      <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-green-700 mb-6">
        المنصة تُعفي جميع المستخدمين من العمولة حتى {formatGregorianDate(exemptUntil!)}.
      </div>
    ) : (
      <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 text-sm text-gray-700 mb-6">
        نسبة العمولة المعتمدة حالياً: <span className="font-bold text-[#6D28D9]">{rate}%</span> من قيمة الصفقة.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
        </div>
        {liveBlock}
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.content }} />
      </main>
      <Footer />
    </div>
  );
}

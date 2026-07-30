import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Profile, StaticPage } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function StaticPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: page }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("static_pages").select("*").eq("slug", slug).single(),
  ]);

  if (!page) notFound();
  const p = page as StaticPage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{p.title}</h1>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.content }} />
      </main>
      <Footer />
    </div>
  );
}

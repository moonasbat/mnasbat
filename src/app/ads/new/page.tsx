import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewAdForm from "@/components/ads/NewAdForm";
import { Category, Profile } from "@/lib/types";
import { NEW_AD_CONTENT } from "@/lib/content";

export default async function NewAdPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{NEW_AD_CONTENT.pageTitle}</h1>
        <p className="text-sm text-gray-500 mb-6">{NEW_AD_CONTENT.pageSubtitle}</p>
        <NewAdForm categories={(categories as Category[]) ?? []} />
      </main>

      <Footer />
    </div>
  );
}

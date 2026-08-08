import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewAdForm from "@/components/ads/NewAdForm";
import { Category, Profile } from "@/lib/types";
import { NEW_AD_CONTENT } from "@/lib/content";
import BackButton from "@/components/BackButton";

export default async function NewAdPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: categories }, { data: maxImagesSetting }, { data: commissionFlag }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("admin_settings").select("value").eq("key", "max_images_per_ad").maybeSingle(),
    supabase.from("feature_flags").select("enabled").eq("key", "commission_tab_enabled").maybeSingle(),
  ]);
  const maxImages = Number(maxImagesSetting?.value) || 10;
  const commissionTabEnabled = commissionFlag?.enabled !== false;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
          <BackButton />
          <h1 className="text-xl font-bold text-gray-900">{NEW_AD_CONTENT.pageTitle}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">{NEW_AD_CONTENT.pageSubtitle}</p>
        <NewAdForm categories={(categories as Category[]) ?? []} initialWhatsapp={(profile as Profile)?.whatsapp} maxImages={maxImages} commissionTabEnabled={commissionTabEnabled} />
      </main>

      <Footer />
    </div>
  );
}

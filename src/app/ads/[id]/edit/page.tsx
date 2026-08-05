import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EditAdForm from "@/components/ads/EditAdForm";
import { Ad, Category, Profile } from "@/lib/types";
import { notFound, redirect } from "next/navigation";
import BackButton from "@/components/BackButton";

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: ad }, { data: categories }, { data: maxImagesSetting }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("ads").select("*, ad_images(*)").eq("id", id).single(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("admin_settings").select("value").eq("key", "max_images_per_ad").maybeSingle(),
  ]);
  const maxImages = Number(maxImagesSetting?.value) || 10;

  if (!ad) notFound();
  if (ad.user_id !== user.id) redirect("/dashboard/ads");
  if (ad.status !== "draft" && Date.now() - new Date(ad.created_at).getTime() > 5 * 60 * 1000) redirect("/dashboard/ads");

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
          <BackButton fallbackHref="/dashboard/ads" />
          <h1 className="text-xl font-bold text-gray-900">تعديل الإعلان</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">حدّث بيانات إعلانك ثم احفظ التعديلات.</p>
        <EditAdForm ad={ad as Ad} categories={(categories as Category[]) ?? []} maxImages={maxImages} />
      </main>
      <Footer />
    </div>
  );
}

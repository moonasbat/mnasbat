import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/ContactForm";
import BackButton from "@/components/BackButton";
import { Profile } from "@/lib/types";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: flag }] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("feature_flags").select("enabled").eq("key", "contact_form_enabled").maybeSingle(),
  ]);

  const enabled = flag ? flag.enabled !== false : true;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">تواصل معنا</h1>
        </div>
        {enabled ? (
          <ContactForm profile={profile as Profile | null} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">التواصل عبر النموذج متوقف مؤقتاً.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

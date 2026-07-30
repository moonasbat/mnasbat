import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Profile } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <DashboardNav />
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}

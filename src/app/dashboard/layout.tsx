import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { getSiteFlags } from "@/lib/siteConfig";
import { Profile } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, flags] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    getSiteFlags(supabase),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid md:grid-cols-[220px_1fr] gap-8 items-start min-w-0">
        <div className="min-w-0 md:sticky md:top-20">
          <DashboardNav commissionTabEnabled={flags.commission_tab_enabled !== false} referralEnabled={flags.referral_program_enabled !== false} />
        </div>
        <div className="min-w-0">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

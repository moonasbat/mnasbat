import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import ProfileEditForm from "@/components/dashboard/ProfileEditForm";
import DeleteAccountButton from "@/components/dashboard/DeleteAccountButton";
import { AUTH_CONTENT } from "@/lib/content";
import { getSiteFlags } from "@/lib/siteConfig";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, flags] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    getSiteFlags(supabase),
  ]);
  const vacationModeEnabled = flags.vacation_mode_enabled !== false;
  const referralEnabled = flags.referral_program_enabled !== false;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navSettings}</h1>
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">المظهر</h2>
        <ThemeToggle labeled />
      </div>
      <ProfileEditForm profile={profile as Profile} vacationModeEnabled={vacationModeEnabled} referralEnabled={referralEnabled} />
      <div className="pt-6 border-t border-gray-100">
        <DeleteAccountButton />
      </div>
    </div>
  );
}

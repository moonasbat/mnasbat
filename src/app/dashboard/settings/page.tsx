import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import ProfileEditForm from "@/components/dashboard/ProfileEditForm";
import DeleteAccountButton from "@/components/dashboard/DeleteAccountButton";
import { AUTH_CONTENT } from "@/lib/content";
import { getSiteFlags } from "@/lib/siteConfig";
import { getCurrentMonthReferralLeaderboard, getUserCurrentMonthReferralCount } from "@/lib/referral";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, flags, { data: prizeRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    getSiteFlags(supabase),
    supabase.from("admin_settings").select("key,value").in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]),
  ]);
  const vacationModeEnabled = flags.vacation_mode_enabled !== false;
  const referralEnabled = flags.referral_program_enabled !== false;

  let referralCount = 0;
  let leaderboard: Awaited<ReturnType<typeof getCurrentMonthReferralLeaderboard>> = [];
  const prizes: number[] = [300, 150, 50];
  if (referralEnabled && user) {
    [referralCount, leaderboard] = await Promise.all([
      getUserCurrentMonthReferralCount(supabase, user.id),
      getCurrentMonthReferralLeaderboard(supabase),
    ]);
    for (const row of prizeRows ?? []) {
      const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
      if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navSettings}</h1>
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">المظهر</h2>
        <ThemeToggle labeled />
      </div>
      <ProfileEditForm
        profile={profile as Profile}
        vacationModeEnabled={vacationModeEnabled}
        referralEnabled={referralEnabled}
        referralCount={referralCount}
        referralLeaderboard={leaderboard}
        referralPrizes={prizes}
      />
      <div className="pt-6 border-t border-gray-100">
        <DeleteAccountButton />
      </div>
    </div>
  );
}

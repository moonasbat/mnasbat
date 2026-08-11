import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthReferralLeaderboard, getUserCurrentMonthReferralCount } from "@/lib/referral";
import ReferralWidget from "@/components/dashboard/ReferralWidget";
import { AUTH_CONTENT } from "@/lib/content";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: prizeRows }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).single(),
    supabase.from("admin_settings").select("key,value").in("key", ["referral_prize_1", "referral_prize_2", "referral_prize_3"]),
  ]);

  const prizes: number[] = [300, 150, 50];
  for (const row of prizeRows ?? []) {
    const idx = row.key === "referral_prize_1" ? 0 : row.key === "referral_prize_2" ? 1 : row.key === "referral_prize_3" ? 2 : -1;
    if (idx >= 0) prizes[idx] = Number(row.value) || prizes[idx];
  }

  if (!profile?.username) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navReferrals}</h1>
        <p className="text-sm text-gray-500">أكمل اسم المستخدم أولاً عشان يصير عندك رابط دعوة خاص بك.</p>
      </div>
    );
  }

  const [referralCount, leaderboard] = await Promise.all([
    getUserCurrentMonthReferralCount(supabase, user.id),
    getCurrentMonthReferralLeaderboard(supabase),
  ]);

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navReferrals}</h1>
        <Link href="/pages/referrals" target="_blank" className="flex items-center gap-1 text-xs text-[#6D28D9] hover:underline shrink-0">
          الشروط والفائزون السابقون <ExternalLink size={12} />
        </Link>
      </div>
      <ReferralWidget username={profile.username} referralCount={referralCount} leaderboard={leaderboard} prizes={prizes} standalone />
    </div>
  );
}

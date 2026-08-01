import { SupabaseClient } from "@supabase/supabase-js";

// عند نشر أول إعلان لمستخدم مُحال، يُكافأ من دعاه بتمييز أحد إعلاناته مجاناً — مرة واحدة فقط لكل مستخدم مُحال
export async function grantReferralRewardIfApplicable(supabase: SupabaseClient, publishedUserId: string) {
  const { data: publishedProfile } = await supabase
    .from("profiles")
    .select("referred_by, referral_rewarded")
    .eq("id", publishedUserId)
    .maybeSingle();

  if (!publishedProfile?.referred_by || publishedProfile.referral_rewarded) return;

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "referral_program_enabled").maybeSingle();
  if (flag && flag.enabled === false) return;

  const { data: daysSetting } = await supabase.from("admin_settings").select("value").eq("key", "referral_reward_days").maybeSingle();
  const days = Number(daysSetting?.value) || 7;

  const { data: referrerAd } = await supabase
    .from("ads")
    .select("id")
    .eq("user_id", publishedProfile.referred_by)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (referrerAd) {
    await supabase
      .from("ads")
      .update({ is_featured: true, featured_until: new Date(Date.now() + days * 86400000).toISOString() })
      .eq("id", referrerAd.id);
  }

  await supabase.from("notifications").insert({
    user_id: publishedProfile.referred_by,
    type: "REFERRAL_REWARD",
    title: "🎉 مكافأة إحالة",
    body: referrerAd
      ? `أحد الأصدقاء الذين دعوتهم نشر أول إعلان له! حصلت على تمييز مجاني لأحد إعلاناتك لمدة ${days} أيام.`
      : `أحد الأصدقاء الذين دعوتهم نشر أول إعلان له! انشر إعلاناً واحصل على تمييز مجاني لمدة ${days} أيام.`,
  });

  await supabase.from("profiles").update({ referral_rewarded: true }).eq("id", publishedUserId);
}

import { createClient } from "@/lib/supabase/server";
import { Ad } from "@/lib/types";
import { getSiteFlags } from "@/lib/siteConfig";
import MyAdsList from "@/components/dashboard/MyAdsList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function MyAdsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: ads }, flags] = await Promise.all([
    supabase.from("ads").select("*, categories(*), ad_images(*)").eq("user_id", user!.id).order("created_at", { ascending: false }),
    getSiteFlags(supabase),
  ]);
  const showStats = flags.view_stats_enabled !== false;
  const renewalEnabled = flags.ad_renewal_enabled !== false;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">إعلاناتي</h1>
        <Link href="/ads/new" className="flex items-center gap-1.5 bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={16} />
          أضف إعلان
        </Link>
      </div>

      <MyAdsList initialAds={(ads as Ad[]) ?? []} showStats={showStats} renewalEnabled={renewalEnabled} />
    </div>
  );
}

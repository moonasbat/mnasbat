import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "favorites_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "ميزة المفضلة غير متاحة حالياً." }, { status: 403 });
  }

  const { ad_id } = await request.json();

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("ad_id", ad_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return NextResponse.json({ favorited: false });
  }

  await supabase.from("favorites").insert({ user_id: user.id, ad_id });
  return NextResponse.json({ favorited: true });
}

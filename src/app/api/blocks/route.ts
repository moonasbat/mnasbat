import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blocked_id } = await request.json();

  const { data: existing } = await supabase
    .from("blocks")
    .select("id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", blocked_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("blocks").delete().eq("id", existing.id);
    return NextResponse.json({ blocked: false });
  }

  await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id });
  return NextResponse.json({ blocked: true });
}

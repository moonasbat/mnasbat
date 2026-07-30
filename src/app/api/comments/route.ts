import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id, body, parent_id } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "التعليق فارغ" }, { status: 400 });
  }

  const { data: ad } = await supabase.from("ads").select("comments_enabled").eq("id", ad_id).single();
  if (!ad?.comments_enabled) {
    return NextResponse.json({ error: "التعليقات غير متاحة على هذا الإعلان" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ ad_id, user_id: user.id, body, parent_id: parent_id ?? null })
    .select("*, profiles(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ comment: data });
}

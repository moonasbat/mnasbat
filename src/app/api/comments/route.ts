import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit({
    supabase,
    settingKey: "rate_limit_comments_per_hour",
    table: "comments",
    userIdColumn: "user_id",
    userId: user.id,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) return NextResponse.json({ error: limit.error }, { status: 429 });

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "comments_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "التعليقات غير متاحة حالياً." }, { status: 403 });
  }

  const { ad_id, body, parent_id } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "التعليق فارغ" }, { status: 400 });
  }

  const { data: ad } = await supabase.from("ads").select("user_id, comments_enabled").eq("id", ad_id).single();
  if (!ad?.comments_enabled) {
    return NextResponse.json({ error: "التعليقات غير متاحة على هذا الإعلان" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ ad_id, user_id: user.id, body, parent_id: parent_id ?? null })
    .select("*, profiles(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const notifyTargets = new Set<string>();
  if (ad.user_id !== user.id) notifyTargets.add(ad.user_id);
  if (parent_id) {
    const { data: parentComment } = await supabase.from("comments").select("user_id").eq("id", parent_id).maybeSingle();
    if (parentComment && parentComment.user_id !== user.id) notifyTargets.add(parentComment.user_id);
  }
  if (notifyTargets.size) {
    await supabase.from("notifications").insert(
      Array.from(notifyTargets).map((user_id) => ({
        user_id,
        type: "NEW_COMMENT",
        title: parent_id ? "رد جديد على تعليقك" : "تعليق جديد",
        body: parent_id ? "قام أحد المستخدمين بالرد على تعليقك." : "لديك تعليق جديد على أحد إعلاناتك.",
      }))
    );
  }

  return NextResponse.json({ comment: data });
}

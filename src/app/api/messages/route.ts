import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

// إنشاء/جلب محادثة مرتبطة بإعلان وإرسال رسالة أولى — يسجل contact_event من نوع message
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit({
    supabase,
    settingKey: "rate_limit_messages_per_hour",
    table: "messages",
    userIdColumn: "sender_id",
    userId: user.id,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) return NextResponse.json({ error: limit.error }, { status: 429 });

  const { ad_id, body } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
  }

  const { data: ad } = await supabase.from("ads").select("user_id, messages_enabled").eq("id", ad_id).single();
  if (!ad) return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  if (!ad.messages_enabled) return NextResponse.json({ error: "الرسائل غير متاحة على هذا الإعلان" }, { status: 403 });
  if (ad.user_id === user.id) return NextResponse.json({ error: "لا يمكنك مراسلة نفسك" }, { status: 400 });

  const { data: blocked } = await supabase
    .from("blocks")
    .select("id")
    .eq("blocker_id", ad.user_id)
    .eq("blocked_id", user.id)
    .maybeSingle();
  if (blocked) return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });

  let { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("ad_id", ad_id)
    .eq("buyer_id", user.id)
    .eq("seller_id", ad.user_id)
    .maybeSingle();

  if (!conversation) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ ad_id, buyer_id: user.id, seller_id: ad.user_id })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    conversation = created;
  }

  await supabase.from("messages").insert({ conversation_id: conversation!.id, sender_id: user.id, body });
  await supabase.from("contact_events").insert({ ad_id, user_id: user.id, type: "message" });
  await supabase.from("notifications").insert({
    user_id: ad.user_id,
    type: "NEW_MESSAGE",
    title: "رسالة جديدة",
    body: "لديك رسالة جديدة بخصوص أحد إعلاناتك.",
  });

  return NextResponse.json({ ok: true, conversation_id: conversation!.id });
}

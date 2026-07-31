import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// يُستدعى دورياً من الهيدر لعرض عدد الإشعارات والرسائل غير المقروءة كـ badge حقيقي
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notifications: 0, messages: 0 });

  const { count: notificationsCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

  const conversationIds = (conversations ?? []).map((c) => c.id);
  let messagesCount = 0;
  if (conversationIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id)
      .eq("is_read", false);
    messagesCount = count ?? 0;
  }

  return NextResponse.json({ notifications: notificationsCount ?? 0, messages: messagesCount });
}

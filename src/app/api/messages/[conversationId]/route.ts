import { createClient } from "@/lib/supabase/server";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

async function requireParticipant(supabase: Awaited<ReturnType<typeof createClient>>, conversationId: string, userId: string) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .single();
  if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) return null;
  return conversation;
}

// جلب رسائل المحادثة — تُستخدم للاستطلاع الدوري (polling) لعرض الرسائل الجديدة دون تحديث الصفحة يدوياً
export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversation = await requireParticipant(supabase, conversationId, user.id);
  if (!conversation) return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "messages_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "الرسائل الخاصة غير متاحة حالياً." }, { status: 403 });
  }

  const { body } = await request.json();
  if (!body?.trim()) return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });

  const conversation = await requireParticipant(supabase, conversationId, user.id);
  if (!conversation) return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const recipientId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
  const { title, body: notifBody } = await renderNotification("NEW_MESSAGE_REPLY");
  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "NEW_MESSAGE",
    title,
    body: notifBody,
    related_id: conversationId,
  });

  return NextResponse.json({ message });
}

// تعليم رسائل الطرف الآخر كمقروءة عند فتح المحادثة
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversation = await requireParticipant(supabase, conversationId, user.id);
  if (!conversation) return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({ ok: true });
}

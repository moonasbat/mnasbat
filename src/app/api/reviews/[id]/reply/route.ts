import { createClient } from "@/lib/supabase/server";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reply } = await request.json();
  if (!reply?.trim()) return NextResponse.json({ error: "نص الرد فارغ." }, { status: 400 });

  const { data: review } = await supabase.from("reviews").select("reviewee_id, reviewer_id").eq("id", id).single();
  if (!review) return NextResponse.json({ error: "التقييم غير موجود." }, { status: 404 });
  if (review.reviewee_id !== user.id) return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });

  const { error } = await supabase
    .from("reviews")
    .update({ reply: reply.trim(), replied_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { title, body: notifBody } = await renderNotification("REVIEW_REPLY");
  await supabase.from("notifications").insert({
    user_id: review.reviewer_id,
    type: "REVIEW_REPLY",
    title,
    body: notifBody,
  });

  return NextResponse.json({ ok: true });
}

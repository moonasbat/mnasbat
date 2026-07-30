import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();
  const { data: ad } = await supabase.from("ads").select("id, user_id, status").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  if (action === "pause") {
    await supabase.from("ads").update({ status: "paused" }).eq("id", id);
  } else if (action === "resume") {
    await supabase.from("ads").update({ status: "published" }).eq("id", id);
  } else if (action === "renew") {
    const { data: settings } = await supabase.from("admin_settings").select("value").eq("key", "ad_duration_days").maybeSingle();
    const durationDays = Number(settings?.value ?? 60);
    await supabase
      .from("ads")
      .update({ status: "published", expires_at: new Date(Date.now() + durationDays * 86400000).toISOString() })
      .eq("id", id);
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ad } = await supabase.from("ads").select("id, user_id").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  await supabase.from("ads").update({ status: "removed" }).eq("id", id);
  return NextResponse.json({ ok: true });
}

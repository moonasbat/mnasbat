import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// يُستدعى دورياً من العميل (AuthListener) لتحديث "آخر تواجد" — بدون أي بيانات حساسة، مجرد وقت
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
  return NextResponse.json({ ok: true });
}

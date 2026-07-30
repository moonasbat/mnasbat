import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { target_type, target_id, reason, details } = await request.json();
  if (!reason) return NextResponse.json({ error: "سبب البلاغ مطلوب" }, { status: 400 });

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type,
    target_id,
    reason,
    details,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

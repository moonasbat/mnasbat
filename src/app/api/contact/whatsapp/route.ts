import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// يسجل contact_event من نوع whatsapp قبل فتح رابط واتساب — القسم 46
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id } = await request.json();
  await supabase.from("contact_events").insert({ ad_id, user_id: user.id, type: "whatsapp" });

  return NextResponse.json({ ok: true });
}

import { createClient } from "@/lib/supabase/server";
import { USERNAME_RULES } from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await request.json();

  if (!username || !USERNAME_RULES.pattern.test(username)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { data: available } = await supabase.rpc("is_username_available", { check_username: username });
  if (!available) {
    return NextResponse.json({ error: "taken" }, { status: 409 });
  }

  const { error } = await supabase.from("profiles").update({ username }).eq("id", user.id);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "taken" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // ربط الإحالة — أول مرة يكمّل فيها المستخدم اسم المستخدم (التسجيل)، إن وُجدت كوكي دعوة صالحة
  const refCookie = request.cookies.get("mnasbat_ref")?.value;
  if (refCookie) {
    const { data: currentProfile } = await supabase.from("profiles").select("referred_by").eq("id", user.id).maybeSingle();
    if (currentProfile && !currentProfile.referred_by) {
      const { data: referrer } = await supabase.from("profiles").select("id").ilike("username", refCookie).maybeSingle();
      if (referrer && referrer.id !== user.id) {
        await supabase.from("profiles").update({ referred_by: referrer.id }).eq("id", user.id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

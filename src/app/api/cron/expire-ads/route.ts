import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// يُستدعى يومياً عبر Vercel Cron (راجع vercel.json) — يحوّل الإعلانات المنتهية الصلاحية تلقائياً
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ads")
    .update({ status: "expired" })
    .eq("status", "published")
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, expired: data?.length ?? 0 });
}

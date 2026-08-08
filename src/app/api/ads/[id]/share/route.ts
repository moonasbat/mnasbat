import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// عدّاد مشاركة/نسخ رابط الإعلان — إجراء عام، لا يحتاج تسجيل دخول (نفس فكرة عدّاد المشاهدات)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  await supabase.rpc("increment_ad_shares", { ad_id_param: id });
  return NextResponse.json({ ok: true });
}

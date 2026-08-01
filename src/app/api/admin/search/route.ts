import { requireStaff } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireStaff();
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ users: [], ads: [] });

  const [{ data: users }, { data: ads }] = await Promise.all([
    admin.from("profiles").select("id, display_name, avatar_url, role").ilike("display_name", `%${q}%`).limit(5),
    admin.from("ads").select("id, title, status, slug").ilike("title", `%${q}%`).limit(5),
  ]);

  return NextResponse.json({ users: users ?? [], ads: ads ?? [] });
}

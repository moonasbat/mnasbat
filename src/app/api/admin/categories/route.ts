import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { id, is_active, sort_order, name } = await request.json();
  const updates: Record<string, unknown> = {};
  if (is_active !== undefined) updates.is_active = is_active;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (name !== undefined) updates.name = name;

  const { error } = await admin.from("categories").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "category_update", "category", id, updates);
  return NextResponse.json({ ok: true });
}

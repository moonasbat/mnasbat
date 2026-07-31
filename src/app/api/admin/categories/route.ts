import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

function generateSlug() {
  return `cat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { name, icon, parent_id, sort_order } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "اسم التصنيف مطلوب." }, { status: 400 });

  let finalSortOrder = sort_order;
  if (finalSortOrder === undefined) {
    // إلحاق التصنيف الجديد في نهاية مجموعته (نفس المستوى) بدل وضعه دائماً في البداية
    let siblings = admin.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    siblings = parent_id ? siblings.eq("parent_id", parent_id) : siblings.is("parent_id", null);
    const { data: last } = await siblings.maybeSingle();
    finalSortOrder = (last?.sort_order ?? -1) + 1;
  }

  const { data, error } = await admin
    .from("categories")
    .insert({
      name: name.trim(),
      slug: generateSlug(),
      icon: parent_id ? null : (icon?.trim() || "✨"),
      parent_id: parent_id || null,
      sort_order: finalSortOrder,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "category_create", "category", data.id, { name, parent_id });
  return NextResponse.json({ category: data });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { id, is_active, sort_order, name, icon } = await request.json();
  const updates: Record<string, unknown> = {};
  if (is_active !== undefined) updates.is_active = is_active;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (name !== undefined) updates.name = name;
  if (icon !== undefined) updates.icon = icon;

  const { error } = await admin.from("categories").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "category_update", "category", id, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "معرف التصنيف مطلوب." }, { status: 400 });

  const [{ count: adsCount }, { count: subsCount }] = await Promise.all([
    admin.from("ads").select("id", { count: "exact", head: true }).eq("category_id", id),
    admin.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id),
  ]);

  if (adsCount && adsCount > 0) {
    return NextResponse.json({ error: `لا يمكن حذف هذا التصنيف — مرتبط بـ ${adsCount} إعلان. عطّله بدل حذفه.` }, { status: 400 });
  }
  if (subsCount && subsCount > 0) {
    return NextResponse.json({ error: "لا يمكن حذف هذا التصنيف — يحتوي على تصنيفات فرعية. احذفها أولاً." }, { status: 400 });
  }

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "category_delete", "category", id, {});
  return NextResponse.json({ ok: true });
}

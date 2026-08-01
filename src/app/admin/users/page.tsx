import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import AdminUserActions from "@/components/admin/AdminUserActions";
import { formatGregorianDate } from "@/lib/formatTime";
import { profileUrl } from "@/lib/profileUrl";
import { Download, Users as UsersIcon } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 30;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  let query = admin.from("profiles").select("*").order("created_at", { ascending: false }).range(from, to + 1);
  if (q) query = query.ilike("display_name", `%${q}%`);
  const { data: rows } = await query;
  const users = (rows ?? []).slice(0, PAGE_SIZE) as Profile[];
  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;

  return (
    <div className="space-y-4">
      <PageHeader
        title="المستخدمون"
        subtitle="جميع حسابات المنصة — ابحث، عدّل الأدوار، أو أوقف حساباً مخالفاً."
        action={
          <a href="/api/admin/export?type=users" className="flex items-center gap-1.5 text-sm font-medium bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-gray-600 hover:border-gray-300">
            <Download size={15} />
            تصدير CSV
          </a>
        }
      />

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="بحث بالاسم…" className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm flex-1 max-w-xs" />
        <button className="bg-[#6D28D9] text-white rounded-xl px-5 py-2.5 text-sm font-medium">بحث</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {users.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 font-medium">الدور</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">تاريخ الانضمام</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <a href={profileUrl(u)} className="flex items-center gap-2.5 hover:underline text-gray-900 font-medium">
                      <div className="w-7 h-7 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.display_name ?? "?").slice(0, 1)
                        )}
                      </div>
                      {u.display_name}
                    </a>
                  </td>
                  <td className="px-4 py-3"><Badge color={u.role === "user" ? "gray" : "purple"}>{ROLE_LABELS[u.role]}</Badge></td>
                  <td className="px-4 py-3">
                    {u.is_banned ? <Badge color="red">محظور</Badge> : <Badge color="green">نشط</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatGregorianDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <AdminUserActions userId={u.id} isBanned={u.is_banned} role={u.role} canChangeRole={me?.role === "super_admin"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={UsersIcon} title="لا يوجد مستخدمون مطابقون" body={q ? "جرّب كلمة بحث مختلفة." : undefined} />
        )}
        <Pagination page={page} hasMore={hasMore} basePath="/admin/users" extraParams={q ? { q } : undefined} />
      </div>
    </div>
  );
}

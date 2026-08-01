import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import AdminUserActions from "@/components/admin/AdminUserActions";
import { formatGregorianDate } from "@/lib/formatTime";
import { profileUrl } from "@/lib/profileUrl";
import { Download } from "lucide-react";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  let query = admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("display_name", `%${q}%`);
  const { data: users } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">المستخدمون</h1>
        <a href="/api/admin/export?type=users" className="flex items-center gap-1.5 text-sm text-[#6D28D9] hover:underline">
          <Download size={15} />
          تصدير CSV
        </a>
      </div>

      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="بحث بالاسم…" className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 max-w-xs" />
        <button className="bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm">بحث</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">الاسم</th>
              <th className="text-right px-4 py-3">الدور</th>
              <th className="text-right px-4 py-3">الحالة</th>
              <th className="text-right px-4 py-3">تاريخ الانضمام</th>
              <th className="text-right px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users as Profile[])?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3"><a href={profileUrl(u)} className="hover:underline text-gray-900">{u.display_name}</a></td>
                <td className="px-4 py-3 text-gray-500">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3">
                  {u.is_banned ? <span className="text-red-600 text-xs">محظور</span> : <span className="text-green-600 text-xs">نشط</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatGregorianDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminUserActions userId={u.id} isBanned={u.is_banned} role={u.role} canChangeRole={me?.role === "super_admin"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

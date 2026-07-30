import { createAdminClient } from "@/lib/supabase/admin";
import { Category } from "@/lib/types";
import AdminCategoryRow from "@/components/admin/AdminCategoryRow";

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("sort_order");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">التصنيفات</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">التصنيف</th>
              <th className="text-right px-4 py-3">الترتيب</th>
              <th className="text-right px-4 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(categories as Category[])?.map((c) => (
              <AdminCategoryRow key={c.id} category={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

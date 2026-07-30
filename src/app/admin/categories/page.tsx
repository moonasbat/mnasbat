import { createAdminClient } from "@/lib/supabase/admin";
import { Category } from "@/lib/types";
import AdminCategoryRow from "@/components/admin/AdminCategoryRow";

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("sort_order");

  const all = (categories as Category[]) ?? [];
  const mains = all.filter((c) => !c.parent_id);
  const ordered: Category[] = [];
  for (const m of mains) {
    ordered.push(m);
    ordered.push(...all.filter((c) => c.parent_id === m.id));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">التصنيفات</h1>
        <p className="text-sm text-gray-500 mt-1">التصنيفات الفرعية تظهر مبنّدة تحت كل تصنيف رئيسي.</p>
      </div>
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
            {ordered.map((c) => (
              <AdminCategoryRow key={c.id} category={c} indented={!!c.parent_id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

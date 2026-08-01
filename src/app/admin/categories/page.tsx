import { createAdminClient } from "@/lib/supabase/admin";
import { Category } from "@/lib/types";
import AdminCategoryManager from "@/components/admin/AdminCategoryManager";
import PageHeader from "@/components/admin/PageHeader";

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("sort_order");

  return (
    <div className="space-y-4">
      <PageHeader
        title="التصنيفات"
        subtitle="أضف أو عدّل أو فعّل/عطّل أي تصنيف رئيسي أو فرعي. لا يمكن حذف تصنيف مرتبط بإعلانات — عطّله بدل حذفه."
      />
      <AdminCategoryManager categories={(categories as Category[]) ?? []} />
    </div>
  );
}

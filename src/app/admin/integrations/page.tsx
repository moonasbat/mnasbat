import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSettings } from "@/lib/types";
import AdminIntegrationsForm from "@/components/admin/AdminIntegrationsForm";

export default async function AdminIntegrationsPage() {
  const admin = createAdminClient();
  const { data: settingsRows } = await admin
    .from("admin_settings")
    .select("key,value")
    .in("key", ["ga4_measurement_id", "google_site_verification", "facebook_pixel_id", "tiktok_pixel_id"]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">التكاملات</h1>
        <p className="text-sm text-gray-500 mt-1">
          اربط الموقع بخدمات خارجية مباشرة من هنا — ألصق المعرف/الرمز من حساب الخدمة نفسها واحفظ، ويصير مفعّلاً على الموقع فوراً بدون أي تعديل تقني.
        </p>
      </div>
      <AdminIntegrationsForm settings={settings} />
    </div>
  );
}

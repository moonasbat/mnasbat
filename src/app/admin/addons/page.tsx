import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSettings } from "@/lib/types";
import AdminAddonsForm from "@/components/admin/AdminAddonsForm";
import PageHeader from "@/components/admin/PageHeader";

const SETTINGS_KEYS = [
  "ga4_measurement_id",
  "google_site_verification",
  "gtm_container_id",
  "facebook_pixel_id",
  "tiktok_pixel_id",
  "snapchat_pixel_id",
  "clarity_project_id",
  "recaptcha_site_key",
  "recaptcha_secret_key",
];

export default async function AdminAddonsPage() {
  const admin = createAdminClient();
  const { data: settingsRows } = await admin.from("admin_settings").select("key,value").in("key", SETTINGS_KEYS);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  return (
    <div className="space-y-4">
      <PageHeader title="الإضافات" subtitle="أدوات حقيقية من مزوّديها الرسميين — الصق المعرف من حساب الأداة نفسها ليصير مفعّلاً على موقعك فوراً." />
      <AdminAddonsForm settings={settings} />
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSettings } from "@/lib/types";
import AdminAddonsForm from "@/components/admin/AdminAddonsForm";
import PageHeader from "@/components/admin/PageHeader";

const SETTINGS_KEYS = [
  "gtm_container_id",
  "google_site_verification",
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
      <PageHeader title="الإضافات" subtitle="اربط Google Tag Manager مرة وحدة، وبعدها أضف وأدر أي أداة تتبع ثانية (Analytics، Facebook Pixel، TikTok، Snapchat، Clarity...) من داخل حسابه مباشرة بدون أي تعديل على الموقع." />
      <AdminAddonsForm settings={settings} />
    </div>
  );
}

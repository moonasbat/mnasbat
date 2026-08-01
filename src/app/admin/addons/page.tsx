import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSettings, FeatureFlags } from "@/lib/types";
import AdminAddonsForm from "@/components/admin/AdminAddonsForm";

const SETTINGS_KEYS = [
  "ga4_measurement_id",
  "google_site_verification",
  "facebook_pixel_id",
  "tiktok_pixel_id",
  "announcement_text",
  "announcement_link",
  "whatsapp_support_number",
  "maintenance_message",
];
const FLAG_KEYS = ["announcement_bar_enabled", "floating_whatsapp_enabled", "maintenance_mode_enabled", "contact_form_enabled"];

export default async function AdminAddonsPage() {
  const admin = createAdminClient();
  const [{ data: settingsRows }, { data: flagRows }] = await Promise.all([
    admin.from("admin_settings").select("key,value").in("key", SETTINGS_KEYS),
    admin.from("feature_flags").select("key,enabled").in("key", FLAG_KEYS),
  ]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  const flags: FeatureFlags = {};
  (flagRows ?? []).forEach((r) => (flags[r.key] = r.enabled));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">الإضافات</h1>
        <p className="text-sm text-gray-500 mt-1">
          فعّل وأضف مزايا جديدة لموقعك مباشرة من هنا — بدون أي تعديل تقني، وتنعكس فوراً على الموقع.
        </p>
      </div>
      <AdminAddonsForm settings={settings} flags={flags} />
    </div>
  );
}

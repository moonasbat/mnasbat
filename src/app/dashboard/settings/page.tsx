import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import ProfileEditForm from "@/components/dashboard/ProfileEditForm";
import DeleteAccountButton from "@/components/dashboard/DeleteAccountButton";
import { AUTH_CONTENT } from "@/lib/content";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navSettings}</h1>
      <ProfileEditForm profile={profile as Profile} />
      <div className="pt-6 border-t border-gray-100">
        <DeleteAccountButton />
      </div>
    </div>
  );
}

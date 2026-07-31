import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "google_login_enabled").maybeSingle();
  const googleLoginEnabled = flag ? flag.enabled : true;

  return (
    <Suspense>
      <LoginForm googleLoginEnabled={googleLoginEnabled} />
    </Suspense>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PING_INTERVAL_MS = 5 * 60 * 1000;

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // نبضة "آخر تواجد" — عند الفتح وكل 5 دقائق طالما التبويب ظاهر، فقط لمستخدم مسجّل دخول
  useEffect(() => {
    let cancelled = false;
    async function ping() {
      if (document.hidden) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      fetch("/api/profile/ping", { method: "POST" }).catch(() => {});
    }
    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);
    const onVisible = () => { if (!document.hidden) ping(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}

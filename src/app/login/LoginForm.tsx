"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { AUTH_CONTENT } from "@/lib/content";
import Link from "next/link";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            nonce: string;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

// نولّد nonce عشوائي، ونمرر النسخة الخام لسوبابيس والنسخة المشفّرة (SHA-256) لجوجل — هذا ما توثّقه سوبابيس كإلزامي مع signInWithIdToken
async function generateNonce(): Promise<[string, string]> {
  const rawNonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(rawNonce));
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [rawNonce, hashedNonce];
}

export default function LoginForm({ googleLoginEnabled }: { googleLoginEnabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") ?? "/";
  const buttonHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gsiReady || !googleLoginEnabled || !buttonHostRef.current || !window.google) return;

    let cancelled = false;

    async function setup() {
      const [rawNonce, hashedNonce] = await generateNonce();
      if (cancelled || !window.google || !buttonHostRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        nonce: hashedNonce,
        callback: async (response) => {
          setLoading(true);
          setError("");
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: rawNonce,
          });
          if (error) {
            setError(AUTH_CONTENT.loginFailed);
            setLoading(false);
            return;
          }
          router.push(redirect);
          router.refresh();
        },
      });

      window.google.accounts.id.renderButton(buttonHostRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        locale: "ar",
      });
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, [gsiReady, googleLoginEnabled, redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setGsiReady(true)} />
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <Link href="/" className="text-2xl font-bold text-[#6D28D9]">
          مناسبات
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-6">{AUTH_CONTENT.welcomeTitle}</h1>
        <p className="text-sm text-gray-500 mt-2 mb-8">{AUTH_CONTENT.welcomeBody}</p>

        {googleLoginEnabled ? (
          <div className="relative flex items-center justify-center min-h-[44px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white text-sm font-medium text-gray-500 z-10">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                {AUTH_CONTENT.loading}
              </div>
            )}
            <div ref={buttonHostRef} className={loading ? "invisible" : ""} />
          </div>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            تسجيل الدخول متوقف مؤقتاً. يرجى المحاولة لاحقاً.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ONBOARDING_CONTENT, USERNAME_RULES } from "@/lib/content";
import { AtSign } from "lucide-react";

export default function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!username.trim()) {
      setError(ONBOARDING_CONTENT.errors.required);
      return;
    }
    if (!USERNAME_RULES.pattern.test(username)) {
      setError(ONBOARDING_CONTENT.errors.invalid);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error === "taken" ? ONBOARDING_CONTENT.errors.taken : ONBOARDING_CONTENT.errors.invalid);
      return;
    }
    router.push(redirect.startsWith("/") ? redirect : "/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6D28D9] flex items-center justify-center mb-4">
          <AtSign size={22} />
        </div>
        <h1 className="text-lg font-bold text-gray-900">{ONBOARDING_CONTENT.title}</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">{ONBOARDING_CONTENT.body}</p>

        <label className="text-sm font-medium text-gray-700 block mb-1">{ONBOARDING_CONTENT.label}</label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder={ONBOARDING_CONTENT.placeholder}
            dir="ltr"
            className="w-full border border-gray-200 rounded-xl pr-8 pl-3 py-2.5 text-sm text-left"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{ONBOARDING_CONTENT.hint}</p>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium mt-6 hover:bg-[#5B21B6] transition-colors disabled:opacity-60"
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? ONBOARDING_CONTENT.checking : ONBOARDING_CONTENT.submit}
        </button>
      </div>
    </div>
  );
}

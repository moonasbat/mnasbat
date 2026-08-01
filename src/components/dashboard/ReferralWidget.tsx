"use client";

import { useState } from "react";
import { Gift, Copy, Check } from "lucide-react";

export default function ReferralWidget({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${username}` : `/?ref=${username}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="bg-gradient-to-bl from-[#6D28D9] to-[#8B5CF6] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={16} />
          <p className="text-sm font-bold">ادعُ صديقك واربح تمييز مجاني</p>
        </div>
        <p className="text-xs text-purple-100 mb-3">شارك رابطك — لما صديقك ينشر أول إعلان له، يتميز أحد إعلاناتك مجاناً.</p>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <span dir="ltr" className="text-xs truncate flex-1">{link}</span>
          <button onClick={copy} className="shrink-0 flex items-center gap-1 bg-white text-[#6D28D9] rounded-lg px-2.5 py-1 text-xs font-medium">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "تم النسخ" : "نسخ"}
          </button>
        </div>
      </div>
    </div>
  );
}

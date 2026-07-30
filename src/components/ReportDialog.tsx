"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { REPORT_REASONS, REPORTS_CONTENT, GENERIC_CONTENT } from "@/lib/content";
import { loginUrl } from "@/lib/loginRedirect";
import { Flag } from "lucide-react";

export default function ReportDialog({
  targetType,
  targetId,
  label = REPORTS_CONTENT.title,
}: {
  targetType: "ad" | "user" | "comment" | "message" | "review";
  targetId: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openDialog() {
    setOpen(true);
  }

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
    });
    setLoading(false);
    if (res.status === 401) {
      router.push(loginUrl(pathname));
      return;
    }
    if (res.ok) {
      setSent(true);
    } else {
      setError(GENERIC_CONTENT.unexpectedError);
    }
  }

  return (
    <>
      <button onClick={openDialog} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
        <Flag size={15} />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <>
                <p className="text-center text-sm text-gray-900 py-4">{REPORTS_CONTENT.received}</p>
                <button onClick={() => setOpen(false)} className="w-full bg-[#6D28D9] text-white rounded-xl py-2.5 text-sm font-medium">
                  إغلاق
                </button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 mb-4">{REPORTS_CONTENT.title}</h3>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3">
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={REPORTS_CONTENT.detailsPlaceholder}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4"
                />
                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {REPORTS_CONTENT.submit}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

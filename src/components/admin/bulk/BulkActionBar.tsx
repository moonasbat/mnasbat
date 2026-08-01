"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBulkSelection } from "./BulkSelectionContext";
import { X } from "lucide-react";

type BulkAction = { value: string; label: string; color: string; needsReason?: boolean };

export default function BulkActionBar({ endpoint, actions }: { endpoint: string; actions: BulkAction[] }) {
  const router = useRouter();
  const { selected, clear } = useBulkSelection();
  const [loading, setLoading] = useState(false);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  if (selected.size === 0) return null;

  async function run(action: string, extraReason?: string) {
    setLoading(true);
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: Array.from(selected), reason: extraReason }),
    });
    setLoading(false);
    setReasonFor(null);
    setReason("");
    clear();
    router.refresh();
  }

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 flex-wrap max-w-full">
        <span className="text-sm font-medium">{selected.size} محدد</span>
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map((a) => (
            <button
              key={a.value}
              disabled={loading}
              onClick={() => (a.needsReason ? setReasonFor(a.value) : run(a.value))}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 ${a.color}`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button onClick={clear} className="text-gray-400 hover:text-white shrink-0"><X size={16} /></button>
      </div>

      {reasonFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReasonFor(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-900 mb-2">السبب</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3" />
            <button
              onClick={() => run(reasonFor, reason)}
              disabled={!reason || loading}
              className="w-full bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
            >
              تأكيد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

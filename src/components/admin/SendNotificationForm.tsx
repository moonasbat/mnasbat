"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserPicker from "./AdminUserPicker";

const SEGMENTS: [string, string][] = [
  ["all", "جميع المستخدمين"],
  ["active_advertisers", "المعلنون النشطون (لديهم إعلان منشور)"],
  ["staff", "الموظفون فقط"],
  ["single", "مستخدم واحد محدد"],
];

export default function SendNotificationForm() {
  const router = useRouter();
  const [segment, setSegment] = useState("all");
  const [selectedUser, setSelectedUser] = useState<{ id: string; display_name: string } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setSent(null);
    setError("");
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUser?.id, title, body, segment }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSent(data.count);
      setTitle("");
      setBody("");
      setSelectedUser(null);
      router.refresh();
    } else {
      setError(data.error ?? "تعذر إرسال الإشعار.");
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 max-w-lg">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">المستلمون</label>
        <select value={segment} onChange={(e) => { setSegment(e.target.value); setSelectedUser(null); }} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
          {SEGMENTS.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {segment === "single" && (
        <AdminUserPicker selected={selectedUser} onSelect={setSelectedUser} onClear={() => setSelectedUser(null)} />
      )}

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإشعار" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="نص الإشعار" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />

      {sent !== null && <p className="text-sm text-green-600">تم إرسال الإشعار إلى {sent} مستخدماً بنجاح.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={loading || !title || !body || (segment === "single" && !selectedUser)}
        className="bg-[#6D28D9] text-white rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "جارٍ الإرسال…" : "إرسال"}
      </button>
    </div>
  );
}

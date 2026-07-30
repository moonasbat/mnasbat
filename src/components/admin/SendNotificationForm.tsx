"use client";

import { useState } from "react";

export default function SendNotificationForm() {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    setLoading(true);
    setSent(false);
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId || undefined, title, body }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setTitle("");
      setBody("");
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 max-w-lg">
      <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="معرف المستخدم (اتركه فارغاً للإرسال للجميع)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإشعار" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="نص الإشعار" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      {sent && <p className="text-sm text-green-600">تم إرسال الإشعار بنجاح.</p>}
      <button onClick={submit} disabled={loading || !title || !body} className="bg-[#6D28D9] text-white rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        إرسال
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Profile } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

export default function ContactForm({ profile }: { profile?: Profile | null }) {
  const [name, setName] = useState(profile?.display_name ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setSending(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "تعذر إرسال الرسالة.");
    }
  }

  if (sent) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <CheckCircle2 size={36} className="text-green-600 mx-auto mb-3" />
        <p className="font-bold text-gray-900">تم إرسال رسالتك</p>
        <p className="text-sm text-gray-500 mt-1">سيتواصل معك فريق مناسبات على بريدك الإلكتروني قريباً.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">الاسم</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">البريد الإلكتروني</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">رسالتك</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={sending} className="bg-[#6D28D9] text-white rounded-xl px-6 py-2.5 text-sm font-medium disabled:opacity-60">
        {sending ? "جارٍ الإرسال…" : "إرسال"}
      </button>
    </div>
  );
}

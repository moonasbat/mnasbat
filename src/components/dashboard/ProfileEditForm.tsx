"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { AUTH_CONTENT } from "@/lib/content";
import SaudiPhoneInput from "@/components/SaudiPhoneInput";

const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر",
  "الطائف", "تبوك", "بريدة", "حائل", "أبها", "خميس مشيط", "جازان", "نجران",
];

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [city, setCity] = useState(profile.city ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, city, phone, whatsapp, bio }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      {profile.username && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">اسم المستخدم</label>
          <p className="text-sm text-gray-500 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5" dir="ltr">
            @{profile.username}
          </p>
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">الاسم</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">المدينة</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
          <option value="">اختر المدينة</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">الجوال</label>
        <SaudiPhoneInput value={phone} onChange={setPhone} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">واتساب الافتراضي</label>
        <SaudiPhoneInput value={whatsapp} onChange={setWhatsapp} />
        <p className="text-xs text-gray-400 mt-1">يُستخدم تلقائياً في إعلاناتك الجديدة إن لم تحدد رقماً مختلفاً.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">نبذة</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
      </div>
      {saved && <p className="text-sm text-green-600">{AUTH_CONTENT.savedSuccess}</p>}
      <button onClick={save} disabled={saving} className="bg-[#6D28D9] text-white rounded-xl px-6 py-2.5 text-sm font-medium disabled:opacity-60">
        حفظ التغييرات
      </button>
    </div>
  );
}

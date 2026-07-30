"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AD_PAGE_CONTENT, GENERIC_CONTENT, whatsappMessage } from "@/lib/content";
import { Heart, MessageSquare, Share2 } from "lucide-react";

export default function ContactPanel({
  adId,
  adTitle,
  whatsapp,
  messagesEnabled,
  isLoggedIn,
  initialFavorited,
}: {
  adId: string;
  adTitle: string;
  whatsapp?: string;
  messagesEnabled: boolean;
  isLoggedIn: boolean;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function requireLogin() {
    if (!isLoggedIn) {
      router.push("/login");
      return true;
    }
    return false;
  }

  async function toggleFavorite() {
    if (requireLogin()) return;
    setFavorited((f) => !f);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: adId }),
    });
    if (!res.ok) setFavorited((f) => !f);
  }

  async function handleWhatsapp() {
    if (requireLogin()) return;
    await fetch("/api/contact/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: adId }),
    });
    const text = encodeURIComponent(whatsappMessage(adTitle));
    window.open(`https://wa.me/${whatsapp?.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  }

  async function sendMessage() {
    if (requireLogin()) return;
    if (!message.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: adId, body: message }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setMessage("");
    } else {
      const data = await res.json();
      setError(data.error ?? GENERIC_CONTENT.unexpectedError);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: adTitle, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
      {messagesEnabled && (
        <>
          {!showForm ? (
            <button
              onClick={() => (requireLogin() ? null : setShowForm(true))}
              className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5B21B6] transition-colors"
            >
              <MessageSquare size={18} />
              {AD_PAGE_CONTENT.sendMessage}
            </button>
          ) : sent ? (
            <p className="text-center text-sm text-green-700 bg-green-50 rounded-xl py-3">{GENERIC_CONTENT.success}</p>
          ) : (
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك…"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                onClick={sendMessage}
                disabled={sending}
                className="w-full bg-[#6D28D9] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
              >
                إرسال
              </button>
            </div>
          )}
        </>
      )}

      {whatsapp && (
        <button
          onClick={handleWhatsapp}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {AD_PAGE_CONTENT.contactWhatsapp}
        </button>
      )}

      <div className="flex items-center justify-between pt-1">
        <button onClick={toggleFavorite} className={`flex items-center gap-1.5 text-sm transition-colors ${favorited ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}>
          <Heart size={16} fill={favorited ? "currentColor" : "none"} />
          {favorited ? AD_PAGE_CONTENT.removeFavorite : AD_PAGE_CONTENT.addFavorite}
        </button>
        <button onClick={share} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6D28D9] transition-colors">
          <Share2 size={16} />
          {AD_PAGE_CONTENT.share}
        </button>
      </div>
    </div>
  );
}

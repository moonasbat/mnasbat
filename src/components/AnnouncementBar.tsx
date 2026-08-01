"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "announcement-dismissed";

export default function AnnouncementBar({ text, link }: { text: string; link?: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) !== text) setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, [text]);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, text);
    } catch {}
  }

  if (dismissed) return null;

  const content = (
    <span className="text-sm font-medium truncate">{text}</span>
  );

  return (
    <div className="bg-[#6D28D9] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 relative">
        {link ? (
          <a href={link} className="hover:underline truncate">
            {content}
          </a>
        ) : (
          content
        )}
        <button
          onClick={dismiss}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white shrink-0"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

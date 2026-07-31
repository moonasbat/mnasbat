"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (alreadyDismissed || isStandalone) return;

    setDismissed(false);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
    if (isIos && isSafari) setShowIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:bottom-4 md:left-4 md:right-auto md:max-w-sm">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-bl from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center text-white font-bold shrink-0">
          م
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">ثبّت تطبيق مناسبات</p>
          {deferredPrompt ? (
            <>
              <p className="text-xs text-gray-500 mt-0.5">أضِفه لشاشتك الرئيسية وادخل عليه بضغطة وحدة بدون متصفح.</p>
              <button
                onClick={install}
                className="mt-2 flex items-center gap-1.5 bg-[#6D28D9] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#5B21B6] transition-colors"
              >
                <Download size={13} />
                تثبيت الآن
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
              اضغط <Share size={13} className="inline shrink-0" /> ثم اختر "إضافة إلى الشاشة الرئيسية".
            </p>
          )}
        </div>
        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 shrink-0" aria-label="إغلاق">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

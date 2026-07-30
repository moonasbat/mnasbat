"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmDelete() {
    setLoading(true);
    await fetch("/api/account/delete", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm text-red-600 hover:underline">
        حذف الحساب
      </button>
    );
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4 max-w-md">
      <p className="text-sm text-red-700 mb-3">
        هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.
      </p>
      <div className="flex gap-2">
        <button onClick={() => setConfirming(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm bg-white">إلغاء</button>
        <button onClick={confirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-60">
          تأكيد الحذف
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function MarkAllRead() {
  const router = useRouter();
  async function markAll() {
    await fetch("/api/notifications/mark-read", { method: "POST" });
    router.refresh();
  }
  return (
    <button onClick={markAll} className="text-sm text-[#6D28D9] hover:underline">
      تحديد الكل كمقروء
    </button>
  );
}

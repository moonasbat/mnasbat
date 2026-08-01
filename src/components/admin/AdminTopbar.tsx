"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS } from "@/lib/adminNav";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminTopbar() {
  const pathname = usePathname();
  const current = ADMIN_NAV_GROUPS.flatMap((g) => g.items).find((i) => i.href === pathname);

  return (
    <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">لوحة التحكم</span>
        {current && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-bold">{current.label}</span>
          </>
        )}
      </div>
      <ThemeToggle />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import { ADMIN_NAV_GROUPS } from "@/lib/adminNav";
import { Menu, X, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function NavLinks({ role, pathname }: { role: UserRole; pathname: string }) {
  return (
    <nav className="space-y-5">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = group.items.filter((i) => i.show(role));
        if (items.length === 0) return null;
        return (
          <div key={group.title || "root"}>
            {group.title && (
              <p className="px-3 mb-1.5 text-[11px] font-bold text-gray-400 tracking-wide">{group.title}</p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active ? "bg-[#6D28D9] text-white shadow-sm shadow-[#6D28D9]/20" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-white" : "text-gray-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminNav({ role, displayName }: { role: UserRole; displayName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* شريط علوي للجوال */}
      <div className="md:hidden flex items-center justify-between bg-gray-50 border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <Link href="/" className="text-lg font-bold text-[#6D28D9]">مناسبات</Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="text-gray-600 p-2 rounded-lg hover:bg-gray-50"
            aria-label="فتح القائمة"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* قائمة منسدلة للجوال */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-gray-50 h-full p-4 mr-auto overflow-y-auto shadow-xl" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xl font-bold text-[#6D28D9]">مناسبات</Link>
              <button onClick={() => setOpen(false)} className="text-gray-400 p-1" aria-label="إغلاق القائمة">
                <X size={20} />
              </button>
            </div>
            <NavLinks role={role} pathname={pathname} />
          </div>
        </div>
      )}

      {/* شريط جانبي لسطح المكتب */}
      <aside className="w-64 shrink-0 bg-gray-50 border-l border-gray-100 min-h-screen hidden md:flex md:flex-col">
        <div className="p-4 border-b border-gray-50">
          <Link href="/" className="text-xl font-bold text-[#6D28D9]">مناسبات</Link>
          <p className="text-[11px] text-gray-400 mt-0.5">لوحة تحكم المنصة</p>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <NavLinks role={role} pathname={pathname} />
        </div>
        <div className="p-3 border-t border-gray-50 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center text-xs font-bold shrink-0">
              {(displayName ?? "M").slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{displayName ?? "—"}</p>
              <p className="text-[11px] text-gray-400">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50"
          >
            <ExternalLink size={14} />
            عرض الموقع
          </Link>
        </div>
      </aside>
    </>
  );
}

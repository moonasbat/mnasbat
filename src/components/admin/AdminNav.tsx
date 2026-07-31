"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import { canManageUsers, canManageSettings, canManageEmployees, canReviewCommissions, canHandleReports, canModerateAds } from "@/lib/permissions";
import { ADMIN_CONTENT } from "@/lib/content";
import { Menu, X } from "lucide-react";

export default function AdminNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = [
    { href: "/admin", label: ADMIN_CONTENT.overview, show: true },
    { href: "/admin/users", label: ADMIN_CONTENT.users, show: canManageUsers(role) },
    { href: "/admin/ads", label: ADMIN_CONTENT.ads, show: canModerateAds(role) },
    { href: "/admin/reports", label: ADMIN_CONTENT.reports, show: canHandleReports(role) },
    { href: "/admin/reviews", label: ADMIN_CONTENT.reviews, show: canModerateAds(role) },
    { href: "/admin/commissions", label: ADMIN_CONTENT.commissions, show: canReviewCommissions(role) },
    { href: "/admin/categories", label: ADMIN_CONTENT.categories, show: role === "super_admin" },
    { href: "/admin/notifications", label: ADMIN_CONTENT.notifications, show: canManageUsers(role) },
    { href: "/admin/settings", label: ADMIN_CONTENT.settings, show: canManageSettings(role) },
    { href: "/admin/integrations", label: ADMIN_CONTENT.integrations, show: role === "super_admin" },
    { href: "/admin/employees", label: ADMIN_CONTENT.permissions, show: canManageEmployees(role) },
    { href: "/admin/audit-log", label: ADMIN_CONTENT.auditLog, show: role === "super_admin" || role === "admin" },
  ];

  const navLinks = (
    <nav className="space-y-1">
      {items.filter((i) => i.show).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[#6D28D9] text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* شريط علوي للجوال */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <Link href="/" className="text-lg font-bold text-[#6D28D9]">مناسبات</Link>
        <button
          onClick={() => setOpen(true)}
          className="text-gray-600 p-2 rounded-lg hover:bg-gray-50"
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* قائمة منسدلة للجوال */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-white h-full p-4 mr-auto overflow-y-auto shadow-xl" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xl font-bold text-[#6D28D9]">مناسبات</Link>
              <button onClick={() => setOpen(false)} className="text-gray-400 p-1" aria-label="إغلاق القائمة">
                <X size={20} />
              </button>
            </div>
            {navLinks}
          </div>
        </div>
      )}

      {/* شريط جانبي لسطح المكتب */}
      <aside className="w-56 shrink-0 bg-white border-l border-gray-100 min-h-screen p-4 hidden md:block">
        <Link href="/" className="text-xl font-bold text-[#6D28D9] block mb-6">مناسبات</Link>
        {navLinks}
      </aside>
    </>
  );
}

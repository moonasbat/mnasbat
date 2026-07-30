"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { HOME_CONTENT, AUTH_CONTENT } from "@/lib/content";
import { isStaff } from "@/lib/permissions";
import { loginUrl } from "@/lib/loginRedirect";
import { Bell, MessageSquare, Heart, Plus, LogOut, User, Settings, LayoutDashboard } from "lucide-react";

export default function Header({ profile }: { profile?: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-[#6D28D9] shrink-0">
          مناسبات
        </Link>

        {pathname !== "/" && (
          <div className="hidden md:flex flex-1 max-w-xl">
            <input
              type="text"
              placeholder={HOME_CONTENT.searchPlaceholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#6D28D9] transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
                }
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/ads/new"
            className="hidden sm:flex items-center gap-2 bg-[#6D28D9] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={16} />
            {HOME_CONTENT.addAdButton}
          </Link>

          {profile ? (
            <>
              <Link href="/favorites" className="p-2 text-gray-500 hover:text-[#6D28D9] transition-colors">
                <Heart size={20} />
              </Link>
              <Link href="/dashboard/messages" className="p-2 text-gray-500 hover:text-[#6D28D9] transition-colors">
                <MessageSquare size={20} />
              </Link>
              <Link href="/dashboard/notifications" className="p-2 text-gray-500 hover:text-[#6D28D9] transition-colors">
                <Bell size={20} />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#6D28D9] focus:outline-none"
                >
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.display_name} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-[#6D28D9] text-white flex items-center justify-center text-sm font-bold">
                      {profile.display_name.charAt(0)}
                    </div>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg border border-gray-100 w-52 z-20 py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-900 truncate">{profile.display_name}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard size={16} className="text-[#6D28D9]" />
                        {AUTH_CONTENT.navMyAds}
                      </Link>
                      <Link href="/commission" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        <User size={16} className="text-[#6D28D9]" />
                        {AUTH_CONTENT.navCommission}
                      </Link>
                      <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        <Settings size={16} className="text-[#6D28D9]" />
                        {AUTH_CONTENT.navSettings}
                      </Link>
                      {isStaff(profile.role) && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <Settings size={16} className="text-[#6D28D9]" />
                          لوحة الإدارة
                        </Link>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        {AUTH_CONTENT.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href={loginUrl(pathname)}
              className="border border-[#6D28D9] text-[#6D28D9] rounded-xl px-4 py-2 text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              دخول
            </Link>
          )}
        </div>
      </div>

      {pathname !== "/" && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder={HOME_CONTENT.searchPlaceholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#6D28D9]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
              }
            }}
          />
        </div>
      )}
    </header>
  );
}

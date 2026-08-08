"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { HOME_CONTENT, AUTH_CONTENT } from "@/lib/content";
import { isStaff } from "@/lib/permissions";
import { loginUrl } from "@/lib/loginRedirect";
import { Bell, MessageSquare, Heart, Plus, LogOut, User, Settings, LayoutDashboard } from "lucide-react";

const PROFILE_CACHE_KEY = "mnasbat_profile_cache";

export default function Header({ profile: profileProp }: { profile?: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState({ notifications: 0, messages: 0 });
  const [platformName, setPlatformName] = useState("مناسبات");
  const [commissionTabEnabled, setCommissionTabEnabled] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  // لو الصفحة ما مررت profile صراحة (صفحات عامة تُخزَّن مؤقتاً بدون تحقق دخول على السيرفر)
  // نجيبه بأنفسنا من المتصفح — يبقي الصفحة نفسها قابلة للتخزين المؤقت (Cache) لصالح السيو والسرعة
  const [profile, setProfile] = useState<Profile | null | undefined>(profileProp);
  useEffect(() => {
    if (profileProp !== undefined) { setProfile(profileProp); return; }
    // نعرض آخر حالة تسجيل دخول معروفة فوراً من ذاكرة المتصفح (بدون انتظار رد الشبكة) —
    // يمنع وميض "دخول/خروج" اللي كان يظهر عند التنقل من صفحة تعرف حالتك فوراً (كصفحة الإعلان)
    // لصفحة عامة مخزَّنة مؤقتاً تحتاج تتأكد من حالتك بنفسها. الجلب من الشبكة يبقى يشتغل بالخلفية
    // ليصحّح الحالة لو تغيّرت فعلياً (تسجيل خروج بتبويب ثاني مثلاً).
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) setProfile(JSON.parse(cached));
    } catch {}
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        try {
          if (data.profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data.profile));
          else localStorage.removeItem(PROFILE_CACHE_KEY);
        } catch {}
      })
      .catch(() => { if (!cancelled) setProfile(null); });
    return () => { cancelled = true; };
  }, [profileProp]);
  // الصفحة الرئيسية وصفحة النتائج عندهما بحث خاص بهما، لا داعٍ لتكراره في الهيدر
  const hideHeaderSearch = pathname === "/" || pathname === "/search";

  // عداد حقيقي للإشعارات والرسائل غير المقروءة — يُحدَّث دورياً وعند العودة لتبويب الموقع
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setUnread({ notifications: data.notifications ?? 0, messages: data.messages ?? 0 });
    }
    load();
    const interval = setInterval(load, 25000);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [profile]);

  // يقيس ارتفاع الهيدر الفعلي (يختلف حسب ظهور شريط البحث للجوال) ويعرّضه كمتغيّر CSS
  // تعتمد عليه العناصر الثابتة (مثل قائمة لوحة التحكم) لتتموضع أسفله دون تراكب
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--header-h", `${el.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hideHeaderSearch]);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.platform_name) setPlatformName(data.platform_name);
        if (typeof data.commission_tab_enabled === "boolean") setCommissionTabEnabled(data.commission_tab_enabled);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch {}
    // نحدّث حالة الهيدر مباشرة بدل ما نعتمد بس على router.refresh() — الهيدر مكوّن عميلي وحالته
    // المحلية ما تتصفّر تلقائياً بمجرد تحديث بيانات السيرفر، فكان يبقى يظهر مسجّل دخول لين تحديث يدوي
    setProfile(null);
    router.refresh();
  }

  return (
    <header ref={headerRef} className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-[#6D28D9] shrink-0">
          {platformName}
        </Link>

        {!hideHeaderSearch && (
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
            aria-label={HOME_CONTENT.addAdButton}
            className="sm:hidden flex items-center justify-center w-9 h-9 bg-[#6D28D9] text-white rounded-full hover:bg-[#5B21B6] transition-colors shrink-0"
          >
            <Plus size={20} />
          </Link>
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
              <Link href="/dashboard/messages" className="relative p-2 text-gray-500 hover:text-[#6D28D9] transition-colors">
                <MessageSquare size={20} />
                {unread.messages > 0 && (
                  <span className="absolute top-0.5 left-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread.messages > 9 ? "9+" : unread.messages}
                  </span>
                )}
              </Link>
              <Link href="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-[#6D28D9] transition-colors">
                <Bell size={20} />
                {unread.notifications > 0 && (
                  <span className="absolute top-0.5 left-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread.notifications > 9 ? "9+" : unread.notifications}
                  </span>
                )}
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
                      {commissionTabEnabled && (
                        <Link href="/commission" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <User size={16} className="text-[#6D28D9]" />
                          {AUTH_CONTENT.navCommission}
                        </Link>
                      )}
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

      {!hideHeaderSearch && (
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

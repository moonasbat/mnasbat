"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User as UserIcon, Megaphone } from "lucide-react";
import { AD_STATUS_LABELS } from "@/lib/content";

type SearchResult = {
  users: { id: string; display_name: string; avatar_url?: string; role: string }[];
  ads: { id: string; title: string; status: string; slug?: string }[];
};

export default function AdminSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({ users: [], ads: [] });
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ users: [], ads: [] });
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults = results.users.length > 0 || results.ads.length > 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="ابحث عن مستخدم أو إعلان…"
          className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-sm focus:outline-none focus:border-[#6D28D9]/40"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 right-0 left-0 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-30 max-h-96 overflow-y-auto">
          {loading && <p className="text-xs text-gray-400 text-center py-4">جارٍ البحث…</p>}
          {!loading && !hasResults && <p className="text-xs text-gray-400 text-center py-4">ما فيه نتائج مطابقة.</p>}

          {results.users.length > 0 && (
            <div>
              <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-gray-400">المستخدمون</p>
              {results.users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => go(`/admin/users/${u.id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-right"
                >
                  <div className="w-7 h-7 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center shrink-0 overflow-hidden">
                    {u.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={13} />
                    )}
                  </div>
                  <span className="text-sm text-gray-800 truncate">{u.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {results.ads.length > 0 && (
            <div>
              <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-gray-400">الإعلانات</p>
              {results.ads.map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => go(`/admin/ads/${ad.id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-right"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                    <Megaphone size={13} />
                  </div>
                  <span className="text-sm text-gray-800 truncate flex-1">{ad.title}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{AD_STATUS_LABELS[ad.status] ?? ad.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

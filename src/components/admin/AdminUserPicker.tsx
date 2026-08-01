"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type UserOption = { id: string; display_name: string };

export default function AdminUserPicker({ onSelect, onClear, selected }: { onSelect: (u: UserOption) => void; onClear: () => void; selected: UserOption | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserOption[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.users ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 text-sm w-fit">
        <span className="font-medium text-gray-800">{selected.display_name}</span>
        <button onClick={onClear} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن اسم المستخدم…"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
      />
      {results.length > 0 && (
        <div className="absolute top-full mt-1 right-0 left-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                onSelect(u);
                setQuery("");
                setResults([]);
              }}
              className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50"
            >
              {u.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

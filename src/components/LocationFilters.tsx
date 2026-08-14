"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nearestSaudiCity } from "@/lib/saudiCities";
import { SAUDI_REGIONS } from "@/lib/saudiLocations";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function LocationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  function setCity(city: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city);
    else params.delete("city");
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  }

  function findNearby() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCity(nearestSaudiCity(pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  const currentCity = searchParams.get("city");

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${currentCity ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9]" : "border-gray-200 text-gray-600"}`}
      >
        <MapPin size={13} />
        {currentCity ?? "المنطقة"}
      </button>
      <button
        onClick={findNearby}
        disabled={locating}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors"
      >
        {locating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
        القريب مني
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-9 right-0 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 max-h-80 overflow-y-auto w-56">
            <button onClick={() => setCity(null)} className="w-full text-right px-3 py-2 text-xs font-bold hover:bg-gray-50">كل المناطق</button>
            {SAUDI_REGIONS.map((r) => (
              <div key={r.region}>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400">{r.region}</p>
                {r.cities.map((c) => (
                  <button key={c} onClick={() => setCity(c)} className="w-full text-right px-3 py-1.5 text-xs hover:bg-gray-50">
                    {c}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Ad } from "@/lib/types";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdCard({ ad }: { ad: Ad }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const image = ad.ad_images?.[0]?.url;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    setFavorited((f) => !f);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: ad.id }),
    });
    if (res.status === 401) {
      setFavorited(false);
      router.push("/login");
    } else if (!res.ok) {
      setFavorited((f) => !f);
    }
  }
  const timeLabel = new Date(ad.published_at ?? ad.created_at).toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {image ? (
          <Image src={image} alt={ad.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📷</div>
        )}
        {ad.is_featured && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            مميز
          </span>
        )}
        <button
          className={`absolute top-2 left-2 bg-white/90 rounded-full p-1.5 transition-colors ${favorited ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
          onClick={toggleFavorite}
          aria-label="إضافة للمفضلة"
        >
          <Heart size={16} fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{ad.title}</h3>
        <div className="flex items-center justify-between mt-2">
          {ad.price ? (
            <span className="font-bold text-[#6D28D9] text-sm">{ad.price.toLocaleString("ar-SA")} ر.س</span>
          ) : (
            <span className="text-xs text-gray-400">السعر حسب الاتفاق</span>
          )}
          <span className="text-xs text-gray-400">{timeLabel}</span>
        </div>
        {ad.city && <p className="text-xs text-gray-400 mt-1">{ad.city}</p>}
      </div>
    </Link>
  );
}

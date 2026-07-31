"use client";

import { Star } from "lucide-react";

// عرض تقييم بالنجوم (للقراءة فقط) — يُستخدم لمتوسط تقييم المستخدم أو تقييم فردي
export function StarRatingDisplay({ value, size = 14 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} من 5 نجوم`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= rounded ? "text-amber-400" : "text-gray-200"} fill={i <= rounded ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

// اختيار تقييم بالنجوم — تُستخدم عند إضافة تقييم جديد
export function StarRatingPicker({ value, onChange, size = 26 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} نجوم`}>
          <Star size={size} className={i <= value ? "text-amber-400" : "text-gray-300"} fill={i <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

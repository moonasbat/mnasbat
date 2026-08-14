"use client";

import { SAUDI_REGIONS } from "@/lib/saudiLocations";

// قائمة موحّدة لاختيار المدينة/المحافظة مجمّعة حسب المنطقة — تُستخدم بكل مكان بالموقع
// يحتاج فيه المستخدم يحدد موقعه (البروفايل، نشر إعلان، فلتر البحث)
export default function CitySelect({
  value,
  onChange,
  className = "",
  placeholder = "اختر المدينة",
}: {
  value: string;
  onChange: (city: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{placeholder}</option>
      {SAUDI_REGIONS.map((r) => (
        <optgroup key={r.region} label={r.region}>
          {r.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

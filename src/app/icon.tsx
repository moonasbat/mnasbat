import { ImageResponse } from "next/og";
import { loadArabicFont } from "@/lib/arabicFont";

// فافيكون بحجم 48×48 — الحد الأدنى الموصى به من جوجل ليظهر بوضوح جنب الرابط بنتائج البحث
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default async function Icon() {
  const fontData = await loadArabicFont("م");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6D28D9, #8B5CF6)",
          borderRadius: 10,
          fontFamily: "Tajawal",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, color: "#FFFFFF", display: "flex" }}>م</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 900 }] }
  );
}

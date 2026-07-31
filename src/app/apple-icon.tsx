import { ImageResponse } from "next/og";
import { loadArabicFont } from "@/lib/arabicFont";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontFamily: "Tajawal",
        }}
      >
        <div style={{ fontSize: 100, fontWeight: 900, color: "#FFFFFF", display: "flex" }}>م</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 900 }] }
  );
}

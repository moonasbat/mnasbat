import { ImageResponse } from "next/og";
import { loadArabicFont } from "@/lib/arabicFont";

export const dynamic = "force-static";

export async function GET() {
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
        <div style={{ fontSize: 120, fontWeight: 900, color: "#FFFFFF", display: "flex" }}>م</div>
      </div>
    ),
    { width: 192, height: 192, fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 900 }] }
  );
}

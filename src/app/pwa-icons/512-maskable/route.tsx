import { ImageResponse } from "next/og";
import { loadArabicFont } from "@/lib/arabicFont";

export const dynamic = "force-static";

// نسخة "maskable": الشعار مصغّر ومتمركز ضمن منطقة أمان 80% لأن أنظمة التشغيل تقص الأيقونة بأشكال مختلفة (دائرة، مربع بزوايا...)
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
        <div style={{ fontSize: 220, fontWeight: 900, color: "#FFFFFF", display: "flex" }}>م</div>
      </div>
    ),
    { width: 512, height: 512, fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 900 }] }
  );
}

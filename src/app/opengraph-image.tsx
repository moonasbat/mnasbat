import { ImageResponse } from "next/og";
import { loadArabicFont } from "@/lib/arabicFont";

export const alt = "مناسبات — سوق إعلانات المناسبات";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT = "مناسبات كل ما يخص مناسبتك… في مكان واحد";

export default async function Image() {
  const fontData = await loadArabicFont(TEXT);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6D28D9, #8B5CF6)",
          fontFamily: "Tajawal",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 900, color: "#FFFFFF", display: "flex" }}>مناسبات</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#EDE9FE", marginTop: 20, display: "flex" }}>
          كل ما يخص مناسبتك… في مكان واحد
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 700 }],
    }
  );
}

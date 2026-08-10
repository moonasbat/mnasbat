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
          direction: "rtl",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 900, color: "#FFFFFF", display: "flex", direction: "rtl" }}>مناسبات</div>
        {/* ملاحظة: satori ما يعكس ترتيب الكلمات تلقائياً حسب direction، فنكتب الكلمات
            بترتيب معكوس بالمصدر عشان تطلع بالترتيب الصحيح بصرياً من اليمين لليسار */}
        <div style={{ fontSize: 40, fontWeight: 700, color: "#EDE9FE", marginTop: 20, display: "flex", direction: "rtl" }}>
          واحد مكان في مناسبتك… يخص ما كل
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Tajawal", data: fontData, style: "normal", weight: 700 }],
    }
  );
}

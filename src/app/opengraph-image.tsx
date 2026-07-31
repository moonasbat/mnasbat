import { ImageResponse } from "next/og";

export const alt = "مناسبات — سوق إعلانات المناسبات";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT = "مناسبات كل ما يخص مناسبتك… في مكان واحد";

// خط Tajawal لا يحتوي الخط الافتراضي في Satori على حروف عربية — نجلبه مباشرة من Google Fonts
async function loadArabicFont(text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("تعذر تحميل الخط");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

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

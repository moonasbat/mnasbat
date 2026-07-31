// خط Tajawal لا يحتوي الخط الافتراضي في Satori على حروف عربية — نجلبه مباشرة من Google Fonts
export async function loadArabicFont(text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("تعذر تحميل الخط");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

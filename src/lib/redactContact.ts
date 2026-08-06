// إخفاء أي رقم جوال أو بريد إلكتروني يُكتب بالعنوان أو الوصف أو التعليقات — عشان التواصل الفعلي
// يصير فقط عبر الرسائل الخاصة أو واتساب داخل الموقع (يحافظ على تتبع العمولة). الرسائل الخاصة
// نفسها مستثناة تماماً ولا يُطبَّق عليها هذا الفلتر.

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)));
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// سلسلة أرقام (بفواصل اختيارية: مسافة/شرطة/نقطة) بمجموع 8 إلى 20 رقم — تغطي صيغ الجوال السعودي
// والدولي المختلفة (بمسافات أو بدونها)، بينما تتجاهل أرقام قصيرة عادية (أسعار، عدّادات، إلخ)
const PHONE_RUN_REGEX = /\+?\d(?:[\s.\-]?\d){7,19}/g;

const PLACEHOLDER = "🚫 [تم إخفاء وسيلة تواصل — تواصل عبر الرسائل الخاصة أو واتساب]";

export function redactContactInfo(text: string): { redacted: string; hadMatch: boolean } {
  if (!text) return { redacted: text, hadMatch: false };

  const normalized = toLatinDigits(text);
  const ranges: [number, number][] = [];

  for (const m of normalized.matchAll(EMAIL_REGEX)) {
    ranges.push([m.index!, m.index! + m[0].length]);
  }
  for (const m of normalized.matchAll(PHONE_RUN_REGEX)) {
    const digitCount = (m[0].match(/\d/g) ?? []).length;
    if (digitCount < 8 || digitCount > 20) continue;
    ranges.push([m.index!, m.index! + m[0].length]);
  }

  if (ranges.length === 0) return { redacted: text, hadMatch: false };

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) {
      last[1] = Math.max(last[1], r[1]);
    } else {
      merged.push([r[0], r[1]]);
    }
  }

  let result = "";
  let cursor = 0;
  for (const [start, end] of merged) {
    result += text.slice(cursor, start) + PLACEHOLDER;
    cursor = end;
  }
  result += text.slice(cursor);

  return { redacted: result, hadMatch: true };
}

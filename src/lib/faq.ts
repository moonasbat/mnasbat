export interface FaqSection {
  title: string;
  items: { q: string; a: string }[];
}

// يحوّل HTML الأسئلة الشائعة (h3 لكل قسم، وp><strong>سؤال</strong><br>جواب</p> لكل سؤال)
// إلى بنية منظّمة تُعرض كأكورديون بدل نص HTML خام متلاصق
export function parseFaqSections(html: string): FaqSection[] {
  const sections: FaqSection[] = [];
  const sectionRe = /<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g;
  const itemRe = /<p><strong>([\s\S]*?)<\/strong><br\s*\/?>([\s\S]*?)<\/p>/g;

  let sectionMatch: RegExpExecArray | null;
  while ((sectionMatch = sectionRe.exec(html))) {
    const title = sectionMatch[1].trim();
    const body = sectionMatch[2];
    const items: { q: string; a: string }[] = [];

    let itemMatch: RegExpExecArray | null;
    itemRe.lastIndex = 0;
    while ((itemMatch = itemRe.exec(body))) {
      items.push({ q: itemMatch[1].trim(), a: itemMatch[2].trim() });
    }

    if (items.length > 0) sections.push({ title, items });
  }

  return sections;
}

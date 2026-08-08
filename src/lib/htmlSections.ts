// يحوّل HTML مقسّم بوسم <h3> لكل عنوان فرعي إلى قائمة أقسام {title, content} — نفس فكرة parseFaqSections
// لكن بدون افتراض بنية سؤال/جواب داخلية، يُستخدم لعرض صفحات مثل شروط الاستخدام كأكورديون منظّم
export function parseHtmlSections(html: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const re = /<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const title = match[1].trim();
    const content = match[2].trim();
    if (content) sections.push({ title, content });
  }
  return sections;
}

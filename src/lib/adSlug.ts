// روابط الإعلانات بصيغة قابلة للقراءة: /ads/{عنوان-مختصر}-{المعرف}
// المعرف (UUID) يبقى دائماً في آخر الرابط وهو مصدر الحقيقة الوحيد للبحث في قاعدة البيانات؛
// الجزء النصي قبله للعرض وتحسين محركات البحث فقط، ولا يحتاج أي عمود جديد أو ترحيل بيانات.

const UUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function slugify(text: string): string {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "");
}

export function adUrl(ad: { id: string; title: string }): string {
  const slug = slugify(ad.title);
  return `/ads/${slug ? `${slug}-` : ""}${ad.id}`;
}

export function extractAdId(param: string): string | null {
  const match = param.match(UUID_RE);
  return match ? match[0] : null;
}

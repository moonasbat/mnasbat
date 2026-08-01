"use client";

// رابط "#" العادي للتنقل داخل نفس الصفحة لا يعتمد عليه دائماً بسبب توقيت الـ hydration في هذا التطبيق —
// نستخدم scrollIntoView صراحةً بعد نقرة فعلية من المستخدم لضمان النتيجة
export default function ScrollToLink({ targetId, className, children }: { targetId: string; className?: string; children: React.ReactNode }) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    requestAnimationFrame(() => {
      // getElementById يرجع أول عنصر بهذا الـid فقط، وقد يكون مخفياً في بعض حالات التنقل — نبحث عن النسخة الظاهرة فعلياً
      const candidates = document.querySelectorAll<HTMLElement>(`#${targetId}`);
      const target = [...candidates].find((el) => el.offsetParent !== null) ?? candidates[0];
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

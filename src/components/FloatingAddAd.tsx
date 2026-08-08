import Link from "next/link";
import { Plus } from "lucide-react";

// زر عائم لإضافة إعلان من أي صفحة بالموقع — لمتصفحي الجوال فقط (الهيدر نفسه فيه زر مماثل بالشاشات الأكبر)
// مكوّن سيرفر بسيط بدون أي state أو hooks عميلية — يضمن ظهوره دائماً بغض النظر عن أي مشاكل Hydration بمكان ثاني بالصفحة
export default function FloatingAddAd() {
  return (
    <Link
      href="/ads/new"
      className="sm:hidden fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-[#6D28D9] shadow-lg flex items-center justify-center hover:bg-[#5B21B6] active:scale-95 transition-all"
      aria-label="أضف إعلان"
    >
      <Plus size={28} className="text-white" />
    </Link>
  );
}

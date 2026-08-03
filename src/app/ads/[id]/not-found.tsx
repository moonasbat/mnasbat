import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import NotFoundRedirect from "@/components/NotFoundRedirect";

export default function AdNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-700 font-medium">هذا الإعلان لم يعد متوفراً</p>
        <p className="text-sm text-gray-400 mt-1">ربما حُذف أو انتهت مدته.</p>
        <NotFoundRedirect seconds={6} />
        <Link href="/" className="text-sm text-[#6D28D9] hover:underline mt-2">
          الرجوع للرئيسية الآن
        </Link>
      </main>
      <Footer />
    </div>
  );
}

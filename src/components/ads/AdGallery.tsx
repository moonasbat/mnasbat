"use client";

import { useState } from "react";
import Image from "next/image";
import { AdImage } from "@/lib/types";
import { ChevronRight, ChevronLeft, Download } from "lucide-react";

// نضيف علم fl_attachment على رابط كلاودنري عشان يفرض تحميل الصورة الأصلية كاملة الأبعاد بدل ما يفتحها المتصفح فقط
function downloadUrl(url: string) {
  return url.replace("/upload/", "/upload/fl_attachment/");
}

export default function AdGallery({ images, title }: { images: AdImage[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-5xl">
        📷
      </div>
    );
  }

  function prev() {
    setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setActive((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-2">
      <div className="rounded-2xl overflow-hidden bg-gray-100 relative aspect-[4/3]">
        <Image src={images[active].url} alt={title} fill className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 shadow transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={next}
              aria-label="الصورة التالية"
              className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 shadow transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {active + 1} / {images.length}
            </span>
          </>
        )}
        <a
          href={downloadUrl(images[active].url)}
          download
          aria-label="تحميل الصورة"
          title="تحميل الصورة"
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 shadow transition-colors"
        >
          <Download size={17} />
        </a>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 transition-colors ${
                i === active ? "border-[#6D28D9]" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image src={img.url} alt={`${title} - صورة ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

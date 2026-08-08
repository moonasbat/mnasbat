"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type PolicySection = { title: string; content: string };

// نفس فكرة FaqAccordion لكن للسياسات — كل بند يفتح ويقفل لحاله بدل ما تصير الصفحة جدار نص طويل
export default function PolicyAccordion({ sections }: { sections: PolicySection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(sections[0]?.title ?? null);

  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const open = openKey === section.title;
        return (
          <div key={section.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenKey(open ? null : section.title)}
              className="w-full flex items-center justify-between gap-3 text-right px-5 py-4"
            >
              <span className="font-bold text-gray-900 text-sm">{section.title}</span>
              <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div
                className="prose prose-sm max-w-none px-5 pb-5 pt-1 text-gray-600 leading-relaxed border-t border-gray-50 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#6D28D9] [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

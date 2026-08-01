"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqSection } from "@/lib/faq";

export default function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(`${sections[0]?.title}-0`);

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-base font-bold text-[#6D28D9] mb-3">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, i) => {
              const key = `${section.title}-${i}`;
              const open = openKey === key;
              return (
                <div key={key} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenKey(open ? null : key)}
                    className="w-full flex items-center justify-between gap-3 text-right px-4 py-3.5"
                  >
                    <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

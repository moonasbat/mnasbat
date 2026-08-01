"use client";

import { createContext, useContext, useState, useMemo } from "react";

type BulkContextValue = {
  selected: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
};

const BulkContext = createContext<BulkContextValue | null>(null);

export function BulkSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const value = useMemo<BulkContextValue>(
    () => ({
      selected,
      toggle: (id: string) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      clear: () => setSelected(new Set()),
    }),
    [selected]
  );

  return <BulkContext.Provider value={value}>{children}</BulkContext.Provider>;
}

export function useBulkSelection() {
  const ctx = useContext(BulkContext);
  if (!ctx) throw new Error("useBulkSelection must be used within BulkSelectionProvider");
  return ctx;
}

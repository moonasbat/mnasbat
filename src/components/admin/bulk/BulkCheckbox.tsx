"use client";

import { useBulkSelection } from "./BulkSelectionContext";

export default function BulkCheckbox({ id }: { id: string }) {
  const { selected, toggle } = useBulkSelection();
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 rounded border-gray-300 text-[#6D28D9] focus:ring-[#6D28D9]/30 shrink-0"
    />
  );
}

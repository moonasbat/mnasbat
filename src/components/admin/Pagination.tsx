import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Pagination({
  page,
  hasMore,
  basePath,
  extraParams,
}: {
  page: number;
  hasMore: boolean;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  if (page === 1 && !hasMore) return null;

  const qs = (p: number) => {
    const params = new URLSearchParams(extraParams);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
      <Link
        href={qs(Math.max(1, page - 1))}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${page <= 1 ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-50"}`}
      >
        <ChevronRight size={16} /> السابق
      </Link>
      <span className="text-gray-400 text-xs">صفحة {page}</span>
      <Link
        href={qs(page + 1)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${!hasMore ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-50"}`}
      >
        التالي <ChevronLeft size={16} />
      </Link>
    </div>
  );
}

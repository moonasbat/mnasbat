"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";

export default function AdminCategoryRow({ category }: { category: Category }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id, is_active: !category.is_active }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr>
      <td className="px-4 py-3">{category.icon} {category.name}</td>
      <td className="px-4 py-3 text-gray-500">{category.sort_order}</td>
      <td className="px-4 py-3">
        <button disabled={loading} onClick={toggle} className={`text-xs px-2 py-1 rounded-lg ${category.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
          {category.is_active ? "مفعّل" : "موقف"}
        </button>
      </td>
    </tr>
  );
}

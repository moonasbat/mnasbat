"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundRedirect({ seconds = 6 }: { seconds?: number }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, router]);

  return (
    <p className="text-sm text-gray-400 mt-3">
      بنرجعك للصفحة الرئيسية خلال {remaining} {remaining === 1 ? "ثانية" : "ثواني"}...
    </p>
  );
}

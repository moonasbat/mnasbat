"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AvatarUpload({ avatarUrl, displayName }: { avatarUrl?: string; displayName: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");

    // نفس روح شروط تويتر لصورة الملف الشخصي: نوع صورة مدعوم فقط، وحد أقصى 5 ميقابايت
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("الصيغ المدعومة: JPG أو PNG أو WEBP فقط.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("حجم الصورة كبير — الحد الأقصى 5 ميقابايت.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const saveRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: uploadData.url }),
      });
      if (!saveRes.ok) throw new Error("تعذر حفظ الصورة.");

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر رفع الصورة. حاول مرة أخرى.");
      setPreview(avatarUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-20 h-20 rounded-full shrink-0 group"
        aria-label="تغيير الصورة الشخصية"
      >
        {preview ? (
          <Image src={preview} alt={displayName} fill unoptimized={preview.startsWith("blob:")} className="rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-2xl font-bold">
            {displayName.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          {uploading ? (
            <Loader2 size={20} className="text-white animate-spin" />
          ) : (
            <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-[#6D28D9] hover:underline disabled:opacity-60"
        >
          {uploading ? "جارٍ الرفع…" : "تغيير الصورة"}
        </button>
        <p className="text-xs text-gray-400 mt-0.5">JPG أو PNG أو WEBP — حتى 5 ميقابايت</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// رفع مباشر من المتصفح لكلاودنري (بعد توقيع من سيرفرنا) — بدون ما يمر الملف على سيرفرنا أولاً،
// يلغي الرحلة المزدوجة اللي كانت تبطّئ رفع الصور كثير خصوصاً مع أبعادها الأصلية الكاملة
export async function uploadToCloudinary(file: File, type: "ad" | "avatar" | "receipt" = "ad"): Promise<{ url: string; public_id: string }> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}));
    throw new Error(data.error ?? "تعذر تجهيز الرفع.");
  }
  const { signature, timestamp, api_key, cloud_name, folder, transformation } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("transformation", transformation);
  formData.append("signature", signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(data.error?.message ?? "تعذر رفع الصورة. حاول مرة أخرى.");
  return { url: data.secure_url as string, public_id: data.public_id as string };
}

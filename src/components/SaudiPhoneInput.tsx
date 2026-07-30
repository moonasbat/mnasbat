"use client";

// حقل رقم جوال سعودي: +966 ثابت، والمستخدم يكمل 9 أرقام (يبدأ عادة بـ5)
// value/onChange يتعاملان مع الرقم الكامل بصيغة "9665XXXXXXXX" (بدون +) ليتوافق مع روابط واتساب

export default function SaudiPhoneInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
}) {
  const local = value.startsWith("966") ? value.slice(3) : value;

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    onChange(digits ? `966${digits}` : "");
  }

  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#6D28D9]">
      <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-l border-gray-200 shrink-0" dir="ltr">
        +966
      </span>
      <input
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? "5XXXXXXXX"}
        dir="ltr"
        inputMode="numeric"
        maxLength={9}
        className="flex-1 px-3 py-2.5 text-sm outline-none min-w-0"
      />
    </div>
  );
}

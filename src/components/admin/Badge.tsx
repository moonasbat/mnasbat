const BADGE_STYLES: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-[#6D28D9]",
};

export default function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: keyof typeof BADGE_STYLES }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap ${BADGE_STYLES[color]}`}>
      {children}
    </span>
  );
}

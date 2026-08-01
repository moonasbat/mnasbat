import { LucideIcon } from "lucide-react";

export default function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
        <Icon size={26} />
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {body && <p className="text-xs text-gray-400 mt-1 max-w-xs">{body}</p>}
    </div>
  );
}

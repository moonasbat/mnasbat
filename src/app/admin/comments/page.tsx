import { createAdminClient } from "@/lib/supabase/admin";
import { Comment } from "@/lib/types";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import AdminCommentActions from "@/components/admin/AdminCommentActions";
import { formatRelativeTime } from "@/lib/formatTime";
import { adUrl } from "@/lib/adSlug";
import { MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = { visible: "ظاهر", hidden: "مخفي", removed: "محذوف" };
const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = { visible: "green", hidden: "amber", removed: "red" };
const PAGE_SIZE = 30;

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { status, page: pageParam } = await searchParams;
  const activeStatus = status ?? "visible";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();
  let query = admin
    .from("comments")
    .select("*, profiles(display_name), ads(id,title,slug)")
    .order("created_at", { ascending: false })
    .range(from, to + 1);
  if (activeStatus !== "all") query = query.eq("status", activeStatus);

  const { data: rows } = await query;
  const comments = (rows ?? []).slice(0, PAGE_SIZE) as (Comment & { ads: { id: string; title: string; slug?: string } | null })[];
  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;

  const statuses: [string, string][] = [
    ["visible", "ظاهرة"],
    ["hidden", "مخفية"],
    ["removed", "محذوفة"],
    ["all", "الكل"],
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="التعليقات" subtitle="راجع أو احذف أي تعليق على أي إعلان بالموقع مباشرة، بدون انتظار بلاغ." />

      <div className="flex flex-wrap gap-2">
        {statuses.map(([key, label]) => (
          <a
            key={key}
            href={`/admin/comments?status=${key}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeStatus === key ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">{c.profiles?.display_name ?? "مستخدم"}</span>
                  <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{STATUS_LABELS[c.status]}</Badge>
                  <span className="text-xs text-gray-400">{formatRelativeTime(c.created_at)}</span>
                </div>
                {c.ads && (
                  <Link href={adUrl(c.ads)} target="_blank" className="flex items-center gap-1 text-xs text-[#6D28D9] hover:underline mt-0.5 w-fit">
                    {c.ads.title}
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>
              <AdminCommentActions commentId={c.id} status={c.status} />
            </div>
            <p className="text-sm text-gray-700 mt-2">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={MessageSquare} title="لا توجد تعليقات في هذا التصنيف" />
          </div>
        )}
      </div>

      {comments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <Pagination page={page} hasMore={hasMore} basePath="/admin/comments" extraParams={{ status: activeStatus }} />
        </div>
      )}
    </div>
  );
}

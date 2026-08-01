import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Ad, Comment, CommissionObligation, Report } from "@/lib/types";
import { AD_STATUS_LABELS } from "@/lib/content";
import { formatGregorianDate, formatNumber, formatRelativeTime } from "@/lib/formatTime";
import { adUrl } from "@/lib/adSlug";
import { profileUrl } from "@/lib/profileUrl";
import AdminAdActions from "@/components/admin/AdminAdActions";
import AdminAdEditForm from "@/components/admin/AdminAdEditForm";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, MessageCircle, MessagesSquare, ExternalLink, Flag, DollarSign } from "lucide-react";

const STATUS_COLOR: Record<string, "green" | "amber" | "gray" | "red"> = {
  published: "green",
  pending_review: "amber",
  paused: "gray",
  rejected: "red",
  expired: "gray",
  removed: "red",
  draft: "gray",
  archived: "gray",
};

const REPORT_STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  in_review: "قيد المراجعة",
  needs_info: "يحتاج معلومات",
  closed: "مغلق",
  action_taken: "إجراء متخذ",
};

export default async function AdminAdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: ad } = await admin.from("ads").select("*, profiles(*), categories(*), ad_images(*)").eq("id", id).single();
  if (!ad) notFound();

  const [{ data: reports }, { data: comments }, { data: obligation }, { data: categories }] = await Promise.all([
    admin.from("reports").select("*").eq("target_type", "ad").eq("target_id", id).order("created_at", { ascending: false }),
    admin.from("comments").select("*, profiles(display_name)").eq("ad_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("commission_obligations").select("*").eq("ad_id", id).order("created_at", { ascending: false }).maybeSingle(),
    admin.from("categories").select("id,name").eq("is_active", true).order("sort_order"),
  ]);

  const a = ad as Ad;
  const images = a.ad_images ?? [];
  const obligationRow = obligation as CommissionObligation | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/admin/ads" />
        <PageHeader title="تفاصيل الإعلان" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{a.title}</h2>
              <Badge color={STATUS_COLOR[a.status] ?? "gray"}>{AD_STATUS_LABELS[a.status]}</Badge>
              {a.is_featured && <Badge color="purple">مميز</Badge>}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              <Link href={`/admin/users/${a.user_id}`} className="hover:underline text-[#6D28D9]">{a.profiles?.display_name}</Link>
              {" · "}{a.categories?.name}{a.city ? ` · ${a.city}` : ""} · {formatGregorianDate(a.created_at)}
            </p>
            {a.price != null && <p className="text-sm font-bold text-gray-900 mt-1">{formatNumber(a.price)} ر.س</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link href={adUrl(a)} target="_blank" className="flex items-center gap-1 text-xs text-[#6D28D9] hover:underline">
              فتح الصفحة الكاملة <ExternalLink size={12} />
            </Link>
            <AdminAdActions adId={a.id} status={a.status} />
          </div>
        </div>

        {a.rejection_reason && <p className="text-xs text-red-600 mt-2">سبب الرفض: {a.rejection_reason}</p>}

        {images.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {images.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap">{a.description}</p>

        <div className="mt-3 pt-3 border-t border-gray-50">
          <AdminAdEditForm
            adId={a.id}
            initial={{ title: a.title, description: a.description, category_id: a.category_id, city: a.city, price: a.price ?? null }}
            categories={(categories ?? []) as { id: string; name: string }[]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Eye size={14} /> المشاهدات</div>
          <p className="text-xl font-bold text-gray-900">{formatNumber(a.views_count ?? 0)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Heart size={14} /> المفضلة</div>
          <p className="text-xl font-bold text-gray-900">{formatNumber(a.favorites_count ?? 0)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MessageCircle size={14} /> التعليقات</div>
          <p className="text-xl font-bold text-gray-900">{formatNumber(a.comments_count ?? 0)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><MessagesSquare size={14} /> رسائل التواصل</div>
          <p className="text-xl font-bold text-gray-900">{formatNumber(a.messages_count ?? 0)}</p>
        </div>
      </div>

      {obligationRow && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><DollarSign size={14} /> التزام العمولة المرتبط</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{formatNumber(obligationRow.amount)} ر.س</span>
            <Badge color={obligationRow.status === "approved" ? "green" : obligationRow.status === "rejected" ? "red" : "amber"}>
              {obligationRow.status === "due" ? "مستحق" : obligationRow.status === "receipt_submitted" ? "إيصال مُرسل" : obligationRow.status === "in_review" ? "قيد المراجعة" : obligationRow.status === "approved" ? "مدفوع" : "مرفوض"}
            </Badge>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2.5">بلاغات على الإعلان</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {reports && reports.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(reports as Report[]).map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{r.reason}</span>
                      <Badge color="gray">{REPORT_STATUS_LABELS[r.status]}</Badge>
                    </div>
                    {r.details && <p className="text-xs text-gray-500 mt-1">{r.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Flag} title="ما فيه بلاغات على هذا الإعلان" />
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2.5">التعليقات</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {comments && comments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(comments as unknown as (Comment & { profiles: { display_name: string } })[]).map((c) => (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{c.profiles?.display_name}</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(c.created_at)}</span>
                      {c.status !== "visible" && <Badge color="amber">{c.status === "hidden" ? "مخفي" : "محذوف"}</Badge>}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{c.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={MessageCircle} title="ما فيه تعليقات على هذا الإعلان" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

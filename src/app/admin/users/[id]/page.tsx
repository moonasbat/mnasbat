import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Ad, CommissionObligation, Profile, Report, Review } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import { AD_STATUS_LABELS } from "@/lib/content";
import { formatGregorianDate, formatLastSeen, formatNumber } from "@/lib/formatTime";
import { profileUrl } from "@/lib/profileUrl";
import { adUrl } from "@/lib/adSlug";
import AdminUserActions from "@/components/admin/AdminUserActions";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import BackButton from "@/components/BackButton";
import { StarRatingDisplay } from "@/components/StarRating";
import Link from "next/link";
import { Megaphone, DollarSign, Flag, Star, ExternalLink } from "lucide-react";

const AD_STATUS_COLOR: Record<string, "green" | "amber" | "gray" | "red"> = {
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

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user: me } } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", me!.id).single();

  const { data: profile } = await admin.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();

  const [
    { data: ads },
    { data: obligations },
    { data: reportsAgainst },
    { data: reportsFiled },
    { data: reviews },
  ] = await Promise.all([
    admin.from("ads").select("*, categories(name)").eq("user_id", id).order("created_at", { ascending: false }).limit(30),
    admin.from("commission_obligations").select("*, ads(title)").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("reports").select("*").eq("target_type", "user").eq("target_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("reports").select("*, profiles!reports_reporter_id_fkey(display_name)").eq("reporter_id", id).order("created_at", { ascending: false }).limit(10),
    admin.from("reviews").select("*, reviewer:profiles!reviews_reviewer_id_fkey(display_name)").eq("reviewee_id", id).eq("status", "approved").order("created_at", { ascending: false }).limit(10),
  ]);

  const p = profile as Profile;
  const adsList = (ads ?? []) as (Ad & { categories: { name: string } | null })[];
  const publishedCount = adsList.filter((a) => a.status === "published").length;
  const obligationsList = (obligations ?? []) as (CommissionObligation & { ads: { title: string } | null })[];
  const totalDue = obligationsList.filter((o) => o.status === "due").reduce((s, o) => s + Number(o.amount), 0);
  const totalPaid = obligationsList.filter((o) => o.status === "approved").reduce((s, o) => s + Number(o.amount), 0);
  const avgRating = p.total_reviews > 0 ? (p.rating_sum / p.total_reviews).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/admin/users" />
        <PageHeader title="تفاصيل المستخدم" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (p.display_name ?? "?").slice(0, 1)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <a href={profileUrl(p)} target="_blank" className="text-lg font-bold text-gray-900 hover:underline">{p.display_name}</a>
                <Badge color={p.role === "user" ? "gray" : "purple"}>{ROLE_LABELS[p.role]}</Badge>
                {p.is_banned ? <Badge color="red">محظور</Badge> : <Badge color="green">نشط</Badge>}
                {p.verification_status === "verified" && <Badge color="blue">موثّق</Badge>}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                انضم {formatGregorianDate(p.created_at)} · {formatLastSeen(p.last_seen_at)}
                {p.city ? ` · ${p.city}` : ""}
              </p>
              {p.is_banned && p.ban_reason && <p className="text-xs text-red-600 mt-1">سبب الحظر: {p.ban_reason}</p>}
            </div>
          </div>
          <AdminUserActions userId={p.id} isBanned={p.is_banned} role={p.role} canChangeRole={myProfile?.role === "super_admin"} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Megaphone size={14} /> الإعلانات</div>
          <p className="text-xl font-bold text-gray-900">{adsList.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{publishedCount} منشور</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><DollarSign size={14} /> العمولات</div>
          <p className="text-xl font-bold text-gray-900">{formatNumber(totalPaid)} ر.س</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatNumber(totalDue)} ر.س مستحق</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Flag size={14} /> البلاغات ضده</div>
          <p className="text-xl font-bold text-gray-900">{reportsAgainst?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">{reportsFiled?.length ?? 0} بلاغ قدّمه</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Star size={14} /> التقييم</div>
          <p className="text-xl font-bold text-gray-900">{avgRating ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{p.total_reviews} تقييم</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-700 mb-2.5">إعلانات المستخدم</p>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {adsList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {adsList.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={adUrl(ad)} target="_blank" className="text-sm font-medium text-gray-900 hover:underline truncate">{ad.title}</Link>
                      <Badge color={AD_STATUS_COLOR[ad.status] ?? "gray"}>{AD_STATUS_LABELS[ad.status]}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{ad.categories?.name} · {formatGregorianDate(ad.created_at)}</p>
                  </div>
                  <Link href={adUrl(ad)} target="_blank" className="text-gray-300 hover:text-[#6D28D9] shrink-0"><ExternalLink size={14} /></Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Megaphone} title="ما نشر أي إعلان بعد" />
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-700 mb-2.5">التزامات العمولة</p>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {obligationsList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {obligationsList.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{o.ads?.title ?? o.ad_reference_text ?? "بدون عنوان"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatGregorianDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-gray-900">{formatNumber(o.amount)} ر.س</span>
                    <Badge color={o.status === "approved" ? "green" : o.status === "rejected" ? "red" : "amber"}>
                      {o.status === "due" ? "مستحق" : o.status === "receipt_submitted" ? "إيصال مُرسل" : o.status === "in_review" ? "قيد المراجعة" : o.status === "approved" ? "مدفوع" : "مرفوض"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={DollarSign} title="ما فيه التزامات عمولة مسجّلة" />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2.5">بلاغات ضد المستخدم</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {reportsAgainst && reportsAgainst.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(reportsAgainst as Report[]).map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{r.reason}</span>
                      <Badge color="gray">{REPORT_STATUS_LABELS[r.status]}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatGregorianDate(r.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Flag} title="ما فيه بلاغات ضده" />
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2.5">آخر التقييمات</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {reviews && reviews.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(reviews as unknown as (Review & { reviewer: { display_name: string } })[]).map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StarRatingDisplay value={r.rating} />
                      <span className="text-xs text-gray-500">{r.reviewer?.display_name}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Star} title="ما فيه تقييمات بعد" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

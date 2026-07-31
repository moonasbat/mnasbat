import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import { Ad, Profile, Review } from "@/lib/types";
import Image from "next/image";
import { Star, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import AddReviewForm from "@/components/AddReviewForm";
import ReviewReplyForm from "@/components/ReviewReplyForm";
import BlockUserButton from "@/components/BlockUserButton";
import ReportDialog from "@/components/ReportDialog";
import { formatGregorianDate } from "@/lib/formatTime";
import { getSiteFlags } from "@/lib/siteConfig";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: currentProfile }, { data: seller }, { data: ads }, { data: reviews }, flags] = await Promise.all([
    user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("ads").select("*, categories(*), ad_images(*)").eq("user_id", id).eq("status", "published").order("published_at", { ascending: false }),
    supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(*)").eq("reviewee_id", id).eq("status", "approved").order("created_at", { ascending: false }).limit(10),
    getSiteFlags(supabase),
  ]);
  const verificationEnabled = flags.verification_enabled !== false;
  const reviewsEnabled = flags.reviews_enabled !== false;

  if (!seller) notFound();

  const s = seller as Profile;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={currentProfile as Profile} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-xl font-bold shrink-0">
            {s.avatar_url ? (
              <Image src={s.avatar_url} alt={s.display_name} width={64} height={64} className="rounded-full object-cover" />
            ) : (
              s.display_name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-lg">{s.display_name}</h1>
              {verificationEnabled && s.verification_status === "verified" && <ShieldCheck size={18} className="text-[#6D28D9]" />}
            </div>
            {s.username && <p className="text-sm text-gray-400" dir="ltr">@{s.username}</p>}
            {s.city && <p className="text-sm text-gray-400">{s.city}</p>}
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Star size={14} className="text-amber-400" fill="currentColor" />
              {s.positive_reviews} تقييم إيجابي · {s.total_reviews} إجمالي
            </div>
            <p className="text-xs text-gray-400 mt-1">عضو منذ {formatGregorianDate(s.created_at)}</p>
          </div>
          {currentProfile && (currentProfile as Profile).id !== s.id && (
            <div className="mr-auto flex flex-col items-end gap-2">
              <BlockUserButton userId={s.id} isLoggedIn={!!user} />
              <ReportDialog targetType="user" targetId={s.id} />
            </div>
          )}
        </div>

        {reviewsEnabled && currentProfile && (currentProfile as Profile).id !== s.id && (
          <div className="mb-8">
            <AddReviewForm revieweeId={s.id} isLoggedIn={!!user} />
          </div>
        )}

        <section className="mb-10">
          <h2 className="font-bold text-gray-900 mb-4">الإعلانات</h2>
          {ads && ads.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(ads as Ad[]).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">لا توجد إعلانات منشورة حالياً.</p>
          )}
        </section>

        {reviewsEnabled && <section>
          <h2 className="font-bold text-gray-900 mb-4">التقييمات</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {(reviews as Review[]).map((r) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className={r.is_positive ? "text-green-600" : "text-red-500"}>
                      {r.is_positive ? "إيجابي" : "سلبي"}
                    </span>
                    <span className="text-xs text-gray-400">— {r.profiles?.display_name}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                  {r.reply ? (
                    <div className="mt-2 bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-[#6D28D9] mb-0.5">رد {s.display_name}</p>
                      <p className="text-sm text-gray-700">{r.reply}</p>
                    </div>
                  ) : (
                    currentProfile && (currentProfile as Profile).id === s.id && <ReviewReplyForm reviewId={r.id} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">لا توجد تقييمات حتى الآن.</p>
          )}
        </section>}
      </main>

      <Footer />
    </div>
  );
}

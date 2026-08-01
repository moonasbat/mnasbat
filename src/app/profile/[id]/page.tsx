import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdCard from "@/components/ads/AdCard";
import { Ad, Profile, Review } from "@/lib/types";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import AddReviewForm from "@/components/AddReviewForm";
import ReviewReplyForm from "@/components/ReviewReplyForm";
import BlockUserButton from "@/components/BlockUserButton";
import ReportDialog from "@/components/ReportDialog";
import { formatGregorianDate, formatLastSeen } from "@/lib/formatTime";
import { getSiteFlags } from "@/lib/siteConfig";
import { StarRatingDisplay } from "@/components/StarRating";
import { averageRating } from "@/lib/rating";
import BackButton from "@/components/BackButton";
import ScrollToLink from "@/components/ScrollToLink";

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
        <div className="mb-5">
          <BackButton />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {s.avatar_url ? (
                <Image src={s.avatar_url} alt={s.display_name} fill className="rounded-full object-cover" />
              ) : (
                s.display_name.charAt(0)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-gray-900 text-lg">{s.display_name}</h1>
                {verificationEnabled && s.verification_status === "verified" && <ShieldCheck size={18} className="text-[#6D28D9] shrink-0" />}
              </div>

              <div className="flex items-center gap-2 flex-wrap text-sm text-gray-400 mt-0.5">
                {s.username && <span dir="ltr">@{s.username}</span>}
                {s.username && s.city && <span>·</span>}
                {s.city && <span>{s.city}</span>}
              </div>

              {reviewsEnabled && (
                <ScrollToLink targetId="reviews" className="inline-flex items-center gap-1.5 text-sm mt-2 hover:opacity-80 transition-opacity">
                  {s.total_reviews > 0 ? (
                    <>
                      <StarRatingDisplay value={averageRating(s)} />
                      <span className="text-gray-600 underline decoration-gray-300 underline-offset-2">
                        {averageRating(s).toFixed(1)} ({s.total_reviews} تقييم)
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">لا توجد تقييمات بعد</span>
                  )}
                </ScrollToLink>
              )}

              {s.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.bio}</p>}

              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400 mt-3">
                <span>عضو منذ {formatGregorianDate(s.created_at)}</span>
                {s.last_seen_at && (
                  <>
                    <span>·</span>
                    <span className={formatLastSeen(s.last_seen_at) === "متصل الآن" ? "text-green-600 font-medium" : ""}>
                      {formatLastSeen(s.last_seen_at)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {currentProfile && (currentProfile as Profile).id !== s.id && (
              <div className="flex flex-col items-end gap-2 shrink-0">
                <BlockUserButton userId={s.id} isLoggedIn={!!user} />
                <ReportDialog targetType="user" targetId={s.id} />
              </div>
            )}
          </div>
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

        {reviewsEnabled && <section id="reviews" className="scroll-mt-24">
          <h2 className="font-bold text-gray-900 mb-4">التقييمات</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {(reviews as Review[]).map((r) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <StarRatingDisplay value={r.rating} size={13} />
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

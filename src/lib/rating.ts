export function averageRating(profile: { rating_sum: number; total_reviews: number }): number {
  if (!profile.total_reviews) return 0;
  return profile.rating_sum / profile.total_reviews;
}

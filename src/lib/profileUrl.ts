export function profileUrl(profile: { username?: string | null; id: string }): string {
  return profile.username ? `/profile/@${profile.username}` : `/profile/${profile.id}`;
}

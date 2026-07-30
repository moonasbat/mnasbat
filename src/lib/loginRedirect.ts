export function loginUrl(pathname: string) {
  return `/login?redirect=${encodeURIComponent(pathname)}`;
}

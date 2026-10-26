/** Routes reachable without a session (same as login). */
export function isPublicAuthPath(pathname: string): boolean {
  if (pathname === '/login' || pathname.startsWith('/login/')) return true;
  if (pathname === '/invite/accept') return true;
  if (pathname === '/invitation/accept') return true;
  return false;
}

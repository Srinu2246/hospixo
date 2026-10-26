/** Routes reachable without a session (same as login). */
export function isPublicAuthPath(pathname: string): boolean {
  if (pathname === '/login' || pathname.startsWith('/login/')) return true;
  if (pathname === '/invite/accept') return true;
  if (pathname === '/invitation/accept') return true;
  return false;
}

/** Guest QR menu — public page; menu data uses `isPublicEndpoint` (no session cookie). */
export function isGuestMenuPath(pathname: string): boolean {
  return pathname === '/guest-menu' || pathname.endsWith('/guest-menu');
}

/** App shell without sidebar/navbar (auth flows + guest menu). */
export function isMinimalAppShellPath(pathname: string): boolean {
  return isPublicAuthPath(pathname) || isGuestMenuPath(pathname);
}

/** Middleware: allow through without a session cookie. */
export function isPublicWithoutSessionPath(pathname: string): boolean {
  return isPublicAuthPath(pathname) || isGuestMenuPath(pathname);
}

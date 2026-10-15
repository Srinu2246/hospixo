import type { AuthUser } from '@/lib/auth';

export function resolveUserInitials(
  user: Pick<AuthUser, 'first_name' | 'last_name'> | null,
): string {
  const fromName = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();
  if (fromName) return fromName;
  return '?';
}

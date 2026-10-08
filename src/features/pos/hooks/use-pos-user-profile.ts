'use client';

import { useAuth } from '@/context/auth';
import { posOperationsProfile } from '@/features/pos/config/nav-operations';

function fallbackInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function usePosUserProfile() {
  const { user } = useAuth();

  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : posOperationsProfile.name;

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() ||
    fallbackInitials(posOperationsProfile.name);

  const role = user?.roles?.[0] ?? posOperationsProfile.role;

  return { name, initials, role };
}

import type { AuthUser } from '@/lib/auth';
import { profileFallbackMobileNumbers } from '@/features/profile/config/profile';
import type { UserProfile } from '@/features/profile/types/user-profile';
import { formatProfileRole } from '@/features/profile/lib/format-profile-role';

export const profileFallbackData: UserProfile = {
  name: 'Helloworld',
  email: 'helloworld2@gmail.com',
  mobileNumbers: profileFallbackMobileNumbers,
  twoFactorEnabled: true,
  roleLabel: 'admin/owner',
};

export function buildUserProfile(user: AuthUser | null): UserProfile {
  if (!user) return profileFallbackData;

  const name =
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || profileFallbackData.name;

  return {
    name,
    email: user.email ?? profileFallbackData.email,
    mobileNumbers: profileFallbackMobileNumbers,
    twoFactorEnabled: true,
    roleLabel: formatProfileRole(user.roles),
  };
}

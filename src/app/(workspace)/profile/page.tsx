import type { Metadata } from 'next';

import { UserProfilePage } from '@/features/profile';

export const metadata: Metadata = {
  title: 'User Profile Settings',
};

export default function ProfilePage() {
  return <UserProfilePage />;
}

import type { Metadata } from 'next';

import { ReviewPage } from '@/features/user-roles/components/create-role/review-page';

export const metadata: Metadata = { title: 'Create Role — Review' };

export default function CreateRoleReviewRoute() {
  return <ReviewPage />;
}

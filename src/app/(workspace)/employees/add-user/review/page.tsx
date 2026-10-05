import type { Metadata } from 'next';

import { AddUserReviewStep } from '@/features/user-roles/components/add-user/step-review';

export const metadata: Metadata = { title: 'Add User — Review' };

export default function AddUserReviewRoute() {
  return <AddUserReviewStep />;
}

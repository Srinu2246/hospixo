import type { Metadata } from 'next';

import { InvitationSuccessPage } from '@/features/user-roles/components/invitation-success/invitation-success-page';

export const metadata: Metadata = { title: 'Invitation Sent' };

export default function InvitationSuccessRoute() {
  return <InvitationSuccessPage />;
}

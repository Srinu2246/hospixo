'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { cancelInvitationAction } from '@/lib/invitations-actions';
import type { InvitationDetailPageData } from '@/lib/invitations-server';
import type { ApiInvitation } from '@/types/users';

type InvitationDetailProps = Readonly<{
  invitationId: string;
  initialData: InvitationDetailPageData;
}>;

/**
 * Invitation detail UI — detail is loaded on the server; cancel uses a Server Action.
 */
export function InvitationDetail({ invitationId, initialData }: InvitationDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [invitation, setInvitation] = useState<ApiInvitation | null>(initialData.invitation);
  const [error, setError] = useState<string | null>(initialData.error);

  function handleCancel() {
    if (!confirm('Cancel this invitation?')) return;

    setError(null);
    startTransition(async () => {
      const result = await cancelInvitationAction(invitationId);
      if (!result.ok) {
        setError(result.message ?? 'Unable to cancel invitation.');
        return;
      }

      if (invitation) {
        setInvitation({
          ...invitation,
          status: (result.status as ApiInvitation['status']) ?? 'cancelled',
        });
      }
      router.refresh();
    });
  }

  if (error && !invitation) return <p role="alert">{error}</p>;
  if (!invitation) return <p role="alert">Invitation not found.</p>;

  const canCancel = invitation.status === 'pending' || invitation.status === 'sent';

  return (
    <div>
      {error ? <p role="alert">{error}</p> : null}
      <dl>
        <dt>Email</dt>
        <dd>{invitation.email}</dd>
        <dt>Status</dt>
        <dd>{invitation.status}</dd>
        <dt>Expires</dt>
        <dd>{invitation.expires_at ?? '—'}</dd>
      </dl>

      {canCancel ? (
        <button type="button" onClick={handleCancel} disabled={isPending}>
          {isPending ? 'Cancelling…' : 'Cancel invitation'}
        </button>
      ) : null}
    </div>
  );
}

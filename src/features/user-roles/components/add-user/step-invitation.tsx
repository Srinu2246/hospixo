'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Check, Info } from 'lucide-react';

import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { resendInvitationAction } from '@/lib/invitations-actions';

import styles from '../invitation-success/invitation-success-page.module.css';

export function AddUserInvitationStep() {
  const {
    user,
    roleName,
    draftStaffId,
    invitationId,
    invitationStatus,
    setInvitationStatus,
    reset,
  } = useAddUser();
  const { employeesHref, editStaffPrefix } = useUsersRolesNav();

  const [isPending, startTransition] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const email = user.email.trim();
  const name = `${user.firstName} ${user.lastName}`.trim() || 'New staff member';
  const role = roleName || 'Branch Manager';
  const branch = user.branch || '—';
  const statusLabel = invitationStatus || 'pending';
  const emailLikelyQueued = statusLabel === 'pending';

  function handleResend() {
    if (!invitationId) {
      setResendError('Invitation id is missing. Send the invite again from Review.');
      return;
    }

    setResendError(null);
    setResendMessage(null);

    startTransition(async () => {
      const result = await resendInvitationAction(invitationId);
      if (!result.ok) {
        setResendError(result.message ?? 'Unable to resend invitation.');
        return;
      }

      setInvitationStatus(result.status ?? 'sent');
      setResendMessage(`Resent invitation email to ${result.email || email}.`);
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.stack}>
        <AddUserWizardStepper currentStepId="review-save" completedThrough={3} />

        <div className={styles.successBlock}>
          <div className={styles.successIcon} aria-hidden>
            <Check size={28} strokeWidth={3} />
          </div>

          <h1 className={styles.title}>Invitation created</h1>
          <p className={styles.subtitle}>
            {email ? (
              <>
                Invitation recorded for <strong>{email}</strong>
                {statusLabel === 'sent'
                  ? '. The backend reported the email as sent.'
                  : '. If the inbox is empty, use Resend or check org email/SMTP settings.'}
              </>
            ) : (
              'Invitation was created, but the email address is missing from this session.'
            )}
          </p>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Invitation Summary</p>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>User</dt>
                <dd>{name}</dd>
              </div>
              <div className={styles.row}>
                <dt>Assigned Role</dt>
                <dd>
                  <span className={styles.roleBadge}>{role}</span>
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Branch</dt>
                <dd>{branch}</dd>
              </div>
              <div className={styles.row}>
                <dt>Status</dt>
                <dd className={styles.status}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {statusLabel}
                </dd>
              </div>
            </dl>
          </div>

          {resendError ? (
            <p role="alert" className={styles.subtitle}>
              {resendError}
            </p>
          ) : null}
          {resendMessage ? <p className={styles.subtitle}>{resendMessage}</p> : null}

          <div className={styles.actions}>
            {invitationId ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleResend}
                disabled={isPending}
              >
                {isPending ? 'Resending…' : 'Resend email'}
              </button>
            ) : (
              <Link href={`${editStaffPrefix}/${draftStaffId}`} className={styles.secondaryBtn}>
                Edit Staff Details
              </Link>
            )}
            <Link href={employeesHref} className={styles.primaryBtn} onClick={() => reset()}>
              Back to Users & Roles
            </Link>
          </div>

          <div className={styles.infoBanner}>
            <Info size={18} className={styles.infoIcon} />
            <p>
              {emailLikelyQueued
                ? 'API create can succeed while the accept-link email still depends on backend mail (SMTP / provider) for this org. Check spam, then Resend, or ask backend to confirm mail delivery logs.'
                : 'The invitee should get an email with a link to set their password. Accept page: /invite/accept?token=…'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Info } from 'lucide-react';

import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';

import styles from './invitation-success-page.module.css';

export function InvitationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dashboardHref, employeesHref } = useUsersRolesNav();

  const email = searchParams?.get('email') ?? 'sarah.chen@example.com';
  const name = searchParams?.get('name') ?? 'Sarah Chen';
  const role = searchParams?.get('role') ?? 'Branch Manager';
  const branch = searchParams?.get('branch') ?? 'Downtown Branch';
  const isDirectCreate = searchParams?.get('sendInvite') === 'false';

  function handleBackToUsers(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    router.push(employeesHref);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.stack}>
        <div className={styles.successIcon} aria-hidden>
          <Check size={28} strokeWidth={3} />
        </div>

        <h1 className={styles.title}>
          {isDirectCreate ? 'User Created Successfully' : 'Invitation Sent Successfully'}
        </h1>
        <p className={styles.subtitle}>
          {isDirectCreate ? (
            <>
              Account has been created for <strong>{email}</strong>
            </>
          ) : (
            <>
              An invitation email has been sent to <strong>{email}</strong>
            </>
          )}
        </p>

        <div className={styles.card}>
          <p className={styles.cardTitle}>
            {isDirectCreate ? 'User Summary' : 'Invitation Summary'}
          </p>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>User</dt>
              <dd className={styles.userCell}>
                <span>{name}</span>
              </dd>
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
                <span
                  className={`${styles.statusDot} ${isDirectCreate ? styles.statusDotActive : ''}`}
                  aria-hidden="true"
                />
                {isDirectCreate ? 'Active' : 'Invited'}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.actions}>
          <Link href={dashboardHref} className={styles.secondaryBtn}>
            Go To Dashboard
          </Link>
          <Link href={employeesHref} className={styles.primaryBtn} onClick={handleBackToUsers}>
            Back to Users & Roles
          </Link>
        </div>

        <div className={styles.infoBanner}>
          <Info size={18} className={styles.infoIcon} />
          <p>
            {isDirectCreate
              ? 'The user account is now active and ready for use in Hospixo.'
              : 'The user will receive an email with instructions to set up their account password and log in for the first time.'}
          </p>
        </div>
      </div>
    </div>
  );
}

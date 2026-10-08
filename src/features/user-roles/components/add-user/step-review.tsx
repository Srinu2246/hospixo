'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { useState, useTransition } from 'react';

import { getTemplateById } from '@/features/user-roles/config/roles';
import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { PermissionsReviewGrid } from '@/features/user-roles/components/create-role/review-permissions-grid';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import {
  withRoleScope,
  withSearchParams,
} from '@/features/user-roles/hooks/use-role-management-level';

import { useAuth } from '@/context/auth';
import { createUserAction, type UsersActionResult } from '@/lib/users-actions';
import { buildCreateUserInput } from '@/lib/users-map';
import { addUserContent } from '@/features/user-roles/config/add-user';

import styles from '../create-role/review-page.module.css';

function displayText(value: string, placeholder: string) {
  return value.trim() || placeholder;
}

export function AddUserReviewStep() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const {
    selectedTemplateId,
    roleName,
    description,
    permissionGroups,
    user,
    setDraftStaffId,
    setInvitationId,
    setInvitationStatus,
  } = useAddUser();

  const { level, employeesHref, addUser } = useUsersRolesNav();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const template = getTemplateById(selectedTemplateId);
  const scope = template?.scope ?? user.scope ?? 'branch';

  const permissionsHref = withRoleScope(addUser.permissions, level);
  const detailsHref = withRoleScope(addUser.details, level);

  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'New staff member';

  const companyId =
    scope === 'organisation' ? null : (user.companyId ?? authUser?.company_id ?? null);
  const branchId = scope === 'branch' ? (user.branchId ?? authUser?.branch_id ?? null) : null;

  function handleCreateRole() {
    if (!user.firstName.trim() || !user.email.trim() || !user.username.trim()) {
      setError(addUserContent.review.errors.required);
      return;
    }

    if (user.password.length < 8) {
      setError(addUserContent.review.errors.passwordMin);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result: UsersActionResult = await createUserAction(
        buildCreateUserInput(
          {
            ...user,
            branchId,
            companyId,
            scope,
          },
          selectedTemplateId,
        ),
      );

      if (!result.ok) {
        setError(result.message ?? addUserContent.review.errors.createFailed);
        return;
      }

      if (result.id) {
        setDraftStaffId(result.id);
        setInvitationId(result.id);
      }
      setInvitationStatus('active');

      const searchObj: Record<string, string> = {
        email: user.email,
        name: fullName,
        role: roleName || template?.title || 'Branch Manager',
        branch:
          scope === 'branch'
            ? user.branch || 'Downtown Branch'
            : scope === 'company'
              ? `${user.company || 'Company'} (All Branches)`
              : 'All Branches',
        scope,
        sendInvite: 'false',
      };

      router.push(withSearchParams(addUser.invitationSuccess, searchObj));
      router.refresh();
    });
  }

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link href={employeesHref}>Users & Roles</Link>
        <span aria-hidden> &gt; </span>

        <Link href={withRoleScope(addUser.root, level)}>Template</Link>

        <span aria-hidden> &gt; </span>

        <span className={styles.breadcrumbCurrent}>Create User</span>
      </p>

      <div className={styles.body}>
        <AddUserWizardStepper
          currentStepId="review-save"
          completedThrough={2}
          enableEditNavigation
        />

        {error ? (
          <div role="alert" className={styles.errorAlert}>
            {error}
          </div>
        ) : null}

        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h2 className={styles.sectionCardTitle}>Role Summary</h2>

            <Link href={permissionsHref} className={styles.editBtn} aria-label="Edit role summary">
              <Pencil size={14} />
            </Link>
          </div>

          <div className={styles.summaryGrid3}>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Role Name</p>

              <p className={styles.summaryValue}>{roleName || 'Branch Manager'}</p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Description</p>

              <p className={styles.summaryValue}>
                {description || 'Manages staff and inventory at a specific branch level.'}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Template</p>

              <p className={styles.summaryValue}>{template?.title ?? 'Branch Manager'}</p>
            </div>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h2 className={styles.sectionCardTitle}>User Information</h2>

            <Link href={detailsHref} className={styles.editBtn} aria-label="Edit user information">
              <Pencil size={14} />
            </Link>
          </div>

          <div className={styles.summaryGrid2}>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>First Name</p>

              <p className={user.firstName.trim() ? styles.summaryValue : styles.summaryValueMuted}>
                {displayText(user.firstName, 'Enter first name')}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Last Name</p>

              <p className={user.lastName.trim() ? styles.summaryValue : styles.summaryValueMuted}>
                {displayText(user.lastName, 'Enter last name')}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Email Address</p>

              <p className={user.email.trim() ? styles.summaryValue : styles.summaryValueMuted}>
                {displayText(user.email, 'e.g. sarah.chen@example.com')}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Username</p>

              <p className={user.username.trim() ? styles.summaryValue : styles.summaryValueMuted}>
                {displayText(user.username, 'Enter username')}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Phone Number</p>

              <p className={user.phone.trim() ? styles.summaryValue : styles.summaryValueMuted}>
                {displayText(user.phone, '+1 (555) 000-0000')}
              </p>
            </div>

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Branch Access Scope</p>

              <p className={styles.summaryValue}>
                {user.branch}
                {scope === 'organisation'
                  ? 'Organisation-Wide'
                  : scope === 'company'
                    ? 'Company'
                    : 'Branch'}
              </p>
            </div>

            {scope !== 'organisation' ? (
              <div className={styles.summaryItem}>
                <p className={styles.summaryLabel}>Company</p>

                <p className={styles.summaryValue}>{user.company || '—'}</p>
              </div>
            ) : null}

            {scope === 'branch' ? (
              <div className={styles.summaryItem}>
                <p className={styles.summaryLabel}>Branch</p>

                <p className={styles.summaryValue}>{user.branch || '—'}</p>
              </div>
            ) : null}

            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Role</p>

              <p className={styles.summaryValue}>
                {roleName || 'Branch Manager'}
                {roleName || template?.title || 'Branch Manager'}
              </p>
            </div>
          </div>
        </section>

        <PermissionsReviewGrid permissionGroups={permissionGroups} editHref={permissionsHref} />
      </div>

      <FooterActions
        left={
          <Link href={permissionsHref} className={styles.secondaryBtn}>
            Back
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCreateRole}
            disabled={isPending}
          >
            {isPending
              ? user.sendInvite
                ? 'Sending…'
                : 'Creating…'
              : user.sendInvite
                ? 'Send Invitation'
                : 'Create User'}
          </button>
        }
      />
    </div>
  );
}

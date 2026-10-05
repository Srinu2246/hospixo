'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { PermissionsPanel } from '@/features/user-roles/components/create-role/permissions-panel';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';

import styles from '../create-role/permissions-accordion.module.css';

export function AddUserPermissionsStep({
  loadError = null,
}: Readonly<{ loadError?: string | null }> = {}) {
  const router = useRouter();
  const {
    roleName,
    description,
    permissionGroups,
    setRoleName,
    setDescription,
    setPermissionEnabled,
    toggleAllInGroup,
  } = useAddUser();
  const { level, employeesHref, addUser } = useUsersRolesNav();

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
        <AddUserWizardStepper currentStepId="configure-permissions" completedThrough={1} />

        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        {permissionGroups.length === 0 && !loadError ? (
          <p className={styles.error} role="status">
            No permissions assigned for the selected role.
          </p>
        ) : null}

        <PermissionsPanel
          roleName={roleName}
          description={description}
          permissionGroups={permissionGroups}
          onRoleNameChange={setRoleName}
          onDescriptionChange={setDescription}
          onPermissionEnabled={setPermissionEnabled}
          onToggleAllInGroup={toggleAllInGroup}
        />
      </div>

      <FooterActions
        left={
          <Link href={withRoleScope(addUser.details, level)} className={styles.secondaryBtn}>
            Back
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => router.push(withRoleScope(addUser.review, level))}
          >
            Save User Access
          </button>
        }
      />
    </div>
  );
}

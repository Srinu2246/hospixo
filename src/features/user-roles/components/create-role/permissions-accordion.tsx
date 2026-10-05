'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';
import { PermissionsPanel } from '@/features/user-roles/components/create-role/permissions-panel';
import { CreateRoleStepper } from '@/features/user-roles/components/shared/create-role-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';

import styles from './permissions-accordion.module.css';

export function PermissionsAccordion({
  loadError = null,
}: Readonly<{ loadError?: string | null }> = {}) {
  const router = useRouter();
  const { level, employeesHref, createRole } = useUsersRolesNav();
  const {
    roleName,
    description,
    permissionGroups,
    setRoleName,
    setDescription,
    setPermissionEnabled,
    toggleAllInGroup,
  } = useCreateRole();

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link href={employeesHref}>Users & Roles</Link>
        <span aria-hidden> &gt; </span>
        <Link href={withRoleScope(createRole.root, level)}>Template</Link>
        <span aria-hidden> &gt; </span>
        <span className={styles.breadcrumbCurrent}>Create Role</span>
      </p>

      <div className={styles.body}>
        <CreateRoleStepper currentStepId="permissions" completedThrough={1} />

        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        {permissionGroups.length === 0 && !loadError ? (
          <p className={styles.error} role="status">
            No permissions assigned for the selected role template.
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
          <Link href={withRoleScope(createRole.root, level)} className={styles.secondaryBtn}>
            Back
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => router.push(withRoleScope(createRole.review, level))}
          >
            Save Role Access
          </button>
        }
      />
    </div>
  );
}

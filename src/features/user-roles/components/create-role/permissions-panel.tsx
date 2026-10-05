'use client';

import type { PermissionGroup } from '@/features/user-roles/config/roles';
import { PermissionsAccordionGrid } from '@/features/user-roles/components/shared/permissions-accordion-grid';

import styles from './permissions-accordion.module.css';

type PermissionsPanelProps = Readonly<{
  roleName: string;
  description: string;
  permissionGroups: PermissionGroup[];
  onRoleNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPermissionEnabled: (groupId: string, permissionId: string, enabled: boolean) => void;
  onToggleAllInGroup: (groupId: string, enabled: boolean) => void;
}>;

export function PermissionsPanel({
  roleName,
  description,
  permissionGroups,
  onRoleNameChange,
  onDescriptionChange,
  onPermissionEnabled,
  onToggleAllInGroup,
}: PermissionsPanelProps) {
  return (
    <div className={styles.mainCard}>
      <h1 className={styles.pageTitle}>Configure Permissions</h1>

      <div className={styles.metaGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Role Name</span>
          <input
            className={styles.input}
            value={roleName}
            onChange={(e) => onRoleNameChange(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Description</span>
          <input
            className={styles.input}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </label>
      </div>

      <section className={styles.permissionsSection}>
        <h2 className={styles.sectionTitle}>Permissions</h2>
        <PermissionsAccordionGrid
          permissionGroups={permissionGroups}
          onPermissionEnabled={onPermissionEnabled}
          onToggleAllInGroup={onToggleAllInGroup}
        />
      </section>
    </div>
  );
}

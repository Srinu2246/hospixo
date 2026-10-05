'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { PermissionGroup } from '@/features/user-roles/config/roles';

import styles from '../create-role/permissions-accordion.module.css';

type PermissionsAccordionGridProps = Readonly<{
  permissionGroups: PermissionGroup[];
  readOnly?: boolean;
  onPermissionEnabled?: (groupId: string, permissionId: string, enabled: boolean) => void;
  onToggleAllInGroup?: (groupId: string, enabled: boolean) => void;
}>;

export function PermissionsAccordionGrid({
  permissionGroups,
  readOnly = false,
  onPermissionEnabled,
  onToggleAllInGroup,
}: PermissionsAccordionGridProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(permissionGroups.map((group) => [group.id, true])),
  );

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className={styles.accordionList}>
      {permissionGroups.map((group) => {
        const visible = group.permissions.filter((p) => p.available !== false);
        if (visible.length === 0) return null;

        const enabledCount = visible.filter((p) => p.enabled).length;
        const open = openGroups[group.id];
        const allEnabled = enabledCount === visible.length;

        return (
          <div key={group.id} className={styles.accordion}>
            <div className={styles.accordionHeader}>
              <button
                type="button"
                className={styles.accordionToggle}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
              >
                <ChevronDown
                  size={18}
                  className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                />
                <span className={styles.groupTitle}>{group.title}</span>
                <span
                  className={`${styles.badge} ${
                    enabledCount > 0 ? styles.badgeOn : styles.badgeOff
                  }`}
                >
                  {enabledCount} enabled
                </span>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={allEnabled}
                aria-label={`Toggle all ${group.title} permissions`}
                className={`${styles.switch} ${allEnabled ? styles.switchOn : ''}`}
                disabled={readOnly || visible.length === 0}
                onClick={() => onToggleAllInGroup?.(group.id, !allEnabled)}
              >
                <span className={styles.switchThumb} />
              </button>
            </div>

            {open ? (
              <div className={styles.accordionBody}>
                {visible.map((permission) => (
                  <div key={permission.id} className={styles.permissionRow}>
                    <div className={styles.permissionText}>
                      <p className={styles.permissionLabel}>{permission.label}</p>
                      <p className={styles.permissionDesc}>{permission.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={permission.enabled}
                      aria-label={`${permission.enabled ? 'Disable' : 'Enable'} ${permission.label}`}
                      className={`${styles.switch} ${permission.enabled ? styles.switchOn : ''}`}
                      disabled={readOnly || permission.available === false}
                      onClick={() =>
                        onPermissionEnabled?.(group.id, permission.id, !permission.enabled)
                      }
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

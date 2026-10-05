'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

import type { PermissionGroup } from '@/features/user-roles/config/roles';

import styles from './review-page.module.css';

type PermissionsReviewGridProps = Readonly<{
  permissionGroups: PermissionGroup[];
  editHref: string;
}>;

export function PermissionsReviewGrid({ permissionGroups, editHref }: PermissionsReviewGridProps) {
  return (
    <div className={styles.permGrid}>
      {permissionGroups.map((group) => (
        <div key={group.id} className={styles.permCard}>
          <div className={styles.permCardHeader}>
            <h3 className={styles.permCardTitle}>{group.title}</h3>
            <Link
              href={editHref}
              className={styles.editBtn}
              aria-label={`Edit ${group.title} permissions`}
            >
              <Pencil size={14} />
            </Link>
          </div>
          <ul className={styles.permList}>
            {group.permissions.map((permission) => (
              <li key={permission.id} className={styles.permItem}>
                <span className={styles.permName}>{permission.label}</span>
                <span className={permission.enabled ? styles.enabled : styles.disabled}>
                  {permission.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';

import { routes } from '@/config/routes';
import type { ApiRole } from '@/types/roles';

import styles from './roles-list-page.module.css';

type RolesListPageContentProps = Readonly<{
  roles: readonly ApiRole[];
  error?: string | null;
  title?: string;
}>;

export function RolesListPageContent({
  roles,
  error = null,
  title = 'Roles',
}: RolesListPageContentProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <Link href={routes.platform.usersRoles.createRole.root} className={styles.primaryBtn}>
          Create role
        </Link>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {roles.length === 0 ? (
        <p className={styles.empty}>No roles found for this organization.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.code}>
                  <td>{role.display_name}</td>
                  <td>{role.code}</td>
                  <td>{role.scope}</td>
                  <td>{role.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

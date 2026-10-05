'use client';

import type { ReactNode } from 'react';

import styles from './users-roles-shell.module.css';

/**
 * Users & Roles content frame.
 * Primary navigation comes from AccessShell — do not mount a second sidebar here.
 */
export function UsersRolesShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.contentOnly}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

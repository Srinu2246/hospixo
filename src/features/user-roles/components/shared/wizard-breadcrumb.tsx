'use client';

import Link from 'next/link';

import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';

import styles from './wizard-breadcrumb.module.css';

type Crumb = Readonly<{ label: string; href?: string }>;

type WizardBreadcrumbProps = Readonly<{
  items: readonly Crumb[];
}>;

export function WizardBreadcrumb({ items }: WizardBreadcrumbProps) {
  const { employeesHref } = useUsersRolesNav();
  const crumbs: Crumb[] = [{ label: 'Users & Roles', href: employeesHref }, ...items];

  return (
    <p className={styles.breadcrumb}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`}>
            {index > 0 ? ' > ' : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className={isLast ? styles.current : undefined}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}

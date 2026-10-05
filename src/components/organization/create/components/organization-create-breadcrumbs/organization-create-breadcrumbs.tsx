import Link from 'next/link';

import { routes } from '@/constants/routes';
import { organizationCreateCopy } from '@/constants/admin/organization-create';

import styles from './organization-create-breadcrumbs.module.css';

export function OrganizationCreateBreadcrumbs() {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link href={routes.admin.organizations}>{organizationCreateCopy.breadcrumbParent}</Link>
      <span aria-hidden>›</span>
      <span>{organizationCreateCopy.breadcrumbCurrent}</span>
    </nav>
  );
}

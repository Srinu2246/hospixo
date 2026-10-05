'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { AdminButton } from '@/components/ui';
import { WizardLayout } from '@/components/shell';
import { organizationCreateCopy } from '@/constants/admin/organization-create';
import { routes } from '@/constants/routes';
import { useOrganizationCreate } from '@/context/organization-create';
import { companyCreatePath, organizationTabPath } from '@/helpers/organization/paths';

import { OrganizationMutationDataPanel } from '../organization-mutation-data-panel/organization-mutation-data-panel';

import styles from './organization-complete-step.module.css';

export function OrganizationCompleteStep() {
  const { data, result } = useOrganizationCreate();
  const orgName = result?.organizationName || data.details.name || 'New Organization';
  const plan = result?.plan || data.commercial.planPublicId || 'Enterprise';
  const organizationId = result?.organizationId;
  const overviewHref = organizationId
    ? organizationTabPath(organizationId, 'overview')
    : routes.admin.organizations;
  const subscriptionHref = organizationId
    ? organizationTabPath(organizationId, 'subscription')
    : routes.admin.organizations;
  const companyCreateHref = companyCreatePath(organizationId);
  // Only a real platform-provisioned org (never a local fallback ID) can host companies.
  const canCreateCompany = result?.source === 'api';

  return (
    <WizardLayout title="" hideCard>
      <div className={styles.successCard}>
        <div className={styles.successIcon} aria-hidden>
          <CheckCircle2 size={36} />
        </div>
        <h2 className={styles.successTitle}>{organizationCreateCopy.completeTitle}</h2>
        <p className={styles.successText}>
          {organizationCreateCopy.completeSubtitle(orgName, plan)}
        </p>

        <div className={styles.detailsBox}>
          <p className={styles.detailsTitle}>INSTANCE DETAILS</p>
          <div className={styles.detailsGrid}>
            <Link href={overviewHref} className={styles.detailItem}>
              <span className={styles.detailLabel}>Organization Name</span>
              <span className={`${styles.detailValue} ${styles.detailLinkValue}`}>{orgName}</span>
            </Link>
            <Link href={overviewHref} className={styles.detailItem}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`${styles.detailValue} ${styles.statusActive}`}>
                {result?.status ?? 'Active'}
              </span>
            </Link>
            <Link href={subscriptionHref} className={styles.detailItem}>
              <span className={styles.detailLabel}>Plan</span>
              <span className={`${styles.detailValue} ${styles.detailLinkValue}`}>{plan}</span>
            </Link>
            <Link href={overviewHref} className={styles.detailItem}>
              <span className={styles.detailLabel}>Created</span>
              <span className={`${styles.detailValue} ${styles.detailLinkValue}`}>
                {result?.createdAt ?? new Date().toLocaleDateString('en-US')}
              </span>
            </Link>
          </div>
        </div>

        {result?.data ? (
          <OrganizationMutationDataPanel
            title={organizationCreateCopy.platformResponseTitle}
            data={result.data}
          />
        ) : null}

        <div className={styles.actions}>
          <AdminButton variant="secondary" href={routes.admin.organizations}>
            {organizationCreateCopy.viewOrganizations}
          </AdminButton>
          <AdminButton href={companyCreateHref} disabled={!canCreateCompany}>
            {organizationCreateCopy.companySetup}
          </AdminButton>
        </div>
      </div>
    </WizardLayout>
  );
}

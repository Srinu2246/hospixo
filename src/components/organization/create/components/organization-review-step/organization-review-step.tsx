'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { FieldValue } from '@/components/ui';
import { WizardLayout, WizardStepper } from '@/components/shell';
import {
  organizationCreateCopy,
  organizationCreateSteps,
} from '@/constants/admin/organization-create';
import { routes } from '@/constants/routes';
import { useOrganizationCreate } from '@/context/organization-create';
import { clearOrganizationsCache } from '@/lib/organizations-cache';
import { useSaveOrganizationDraft } from '@/components/organization/create/lib/use-save-draft';
import { isOrganizationCreateStepBlocked } from '@/components/organization/create/lib/validation';
import {
  canSubmitOrganizationCreate,
  getOrganizationCreateValidationError,
} from '@/components/organization/create/lib/validation';

import { OrganizationCreateActions } from '../organization-create-actions/organization-create-actions';

import styles from './organization-review-step.module.css';

type ReviewBlockProps = Readonly<{
  title: string;
  editHref: string;
  rows: Array<{ label: string; value: string }>;
}>;

function ReviewBlock({ title, editHref, rows }: ReviewBlockProps) {
  return (
    <article className={styles.block}>
      <div className={styles.blockHeader}>
        <h3 className={styles.blockTitle}>{title}</h3>
        <Link href={editHref} className={styles.editLink}>
          Edit
        </Link>
      </div>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>{row.label}</dt>
            <dd>
              <FieldValue text={row.value} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function formatSubmitError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return organizationCreateCopy.createFailed;
}

export function OrganizationReviewStep() {
  const router = useRouter();
  const { data, setResult, draftOrganizationId } = useOrganizationCreate();
  const { details, admin, commercial } = data;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const { saveDraft, savingDraft, draftMessage, draftOk } = useSaveOrganizationDraft();
  const prevPath = organizationCreateSteps[1].path;
  const busy = submitting || isNavigating || savingDraft;
  const canSubmit = canSubmitOrganizationCreate(data);
  const primaryDisabled = isOrganizationCreateStepBlocked(canSubmit, {
    savingDraft: busy,
  });
  const blockingMessage = useMemo(
    () => (canSubmit ? null : getOrganizationCreateValidationError(data)),
    [canSubmit, data],
  );

  const handleCreate = async () => {
    if (busy) return;
    if (!canSubmit) {
      setSubmitError(
        getOrganizationCreateValidationError(data) ??
          'Review the organization details and correct each highlighted field before creating the organization.',
      );
      return;
    }
    if (!details.name) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, draftOrganizationId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || organizationCreateCopy.createFailed);
      }
      clearOrganizationsCache();
      setResult(result);
      startNavigation(() => {
        router.push(routes.admin.organizationsCreateComplete);
        router.refresh();
      });
    } catch (error) {
      setSubmitError(formatSubmitError(error));
      setSubmitting(false);
    }
  };

  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(' ');
  const primaryLabel =
    submitting || isNavigating
      ? organizationCreateCopy.creatingOrganization
      : organizationCreateCopy.submitOrganization;

  return (
    <WizardLayout
      title=""
      cardTitle={organizationCreateCopy.reviewTitle}
      stepper={
        <WizardStepper
          steps={organizationCreateSteps}
          currentStepId="review"
          enableEditNavigation
          ariaLabel="Organization creation progress"
        />
      }
      footer={
        <OrganizationCreateActions
          showBack
          backHref={prevPath}
          cancelHref={routes.admin.organizations}
          primaryLabel={primaryLabel}
          onPrimary={handleCreate}
          primaryDisabled={primaryDisabled}
          primaryLoading={submitting || isNavigating}
          onSaveDraft={saveDraft}
          saveDraftLabel={
            savingDraft ? organizationCreateCopy.savingDraft : organizationCreateCopy.saveDraft
          }
          saveDraftDisabled={busy}
        />
      }
    >
      {draftMessage ? (
        <p
          className={draftOk === false ? styles.draftMessageError : styles.draftMessage}
          role="status"
        >
          {draftMessage}
        </p>
      ) : null}
      {submitError || blockingMessage ? (
        <p className={styles.submitError} role="alert">
          {submitError ?? blockingMessage}
        </p>
      ) : null}
      <div className={styles.grid}>
        <ReviewBlock
          title="Organization Details"
          editHref={organizationCreateSteps[0].path}
          rows={[
            { label: 'Organization Name', value: details.name },
            { label: 'Country', value: details.country },
            { label: 'City', value: details.city },
            { label: 'Timezone', value: details.timezone },
            { label: 'Base Currency', value: details.baseCurrency },
            { label: 'Logo', value: details.logoFileName ?? '' },
          ]}
        />
        <ReviewBlock
          title="Commercial Setup"
          editHref={organizationCreateSteps[1].path}
          rows={[
            { label: 'Plan', value: commercial.planPublicId },
            { label: 'Billing Cycle', value: commercial.billingCycle },
            { label: 'Legal Entity Name', value: commercial.legalName },
            {
              label: 'Billing Country Code',
              value: commercial.billingCountryCode,
            },
            { label: 'Billing State Code', value: commercial.billingStateCode },
            {
              label: 'Tax Registration Status',
              value: commercial.taxRegistrationStatus,
            },
            {
              label: 'Tax Registration Number',
              value: commercial.taxRegistrationNumber,
            },
            {
              label: 'Payment Method Code',
              value: commercial.paymentMethodCode,
            },
          ]}
        />
        <ReviewBlock
          title="Organization Admin"
          editHref={organizationCreateSteps[1].path}
          rows={[
            { label: 'Full Name', value: adminName },
            { label: 'Email', value: admin.email },
            { label: 'Phone', value: admin.phone },
            {
              label: 'Welcome Email',
              value: commercial.sendWelcomeEmail ? 'Yes' : 'No',
            },
          ]}
        />
      </div>
    </WizardLayout>
  );
}

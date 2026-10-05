'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { getTemplateById } from '@/features/user-roles/config/roles';
import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';
import { PermissionsReviewGrid } from '@/features/user-roles/components/create-role/review-permissions-grid';
import { CreateRoleStepper } from '@/features/user-roles/components/shared/create-role-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import {
  withRoleScope,
  withSearchParams,
} from '@/features/user-roles/hooks/use-role-management-level';
import { createRoleAction } from '@/lib/roles-actions';
import { buildCreateRoleInput } from '@/lib/roles-map';

import styles from './review-page.module.css';

export function ReviewPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { level, employeesHref, createRole } = useUsersRolesNav();
  const {
    flow,
    selectedTemplateId,
    roleName,
    description,
    permissionGroups,
    templateReturnTo,
    reset,
  } = useCreateRole();

  const isTemplateFlow = flow === 'create-template';
  const template = getTemplateById(selectedTemplateId);
  const templateSelectHref = withRoleScope(createRole.root, level);
  const permissionsBackHref = withRoleScope(
    isTemplateFlow ? createRole.customTemplate : createRole.permissions,
    level,
  );
  const permissionsEditHref = permissionsBackHref;

  async function handleCreate() {
    const name = roleName.trim() || (isTemplateFlow ? 'Custom role' : 'Role');
    const returnHref = templateReturnTo ?? templateSelectHref;
    setSubmitError(null);
    setIsSubmitting(true);

    const result = await createRoleAction(
      buildCreateRoleInput({
        roleName: name,
        description,
        permissionGroups,
        templateCode: isTemplateFlow ? 'custom' : selectedTemplateId,
        scope:
          template?.scope === 'organisation'
            ? 'organization'
            : template?.scope === 'company' || template?.scope === 'branch'
              ? template.scope
              : 'branch',
      }),
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message ?? 'Unable to create role.');
      return;
    }

    reset();
    if (isTemplateFlow) {
      router.push(
        withSearchParams(returnHref, {
          toast: 'template-created',
          name,
        }),
      );
      return;
    }
    router.push(employeesHref);
  }

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link href={employeesHref}>Users & Roles</Link>
        <span aria-hidden> &gt; </span>
        <Link href={withRoleScope(createRole.root, level)}>Template</Link>
        {isTemplateFlow ? (
          <>
            <span aria-hidden> &gt; </span>
            <Link href={withRoleScope(createRole.customTemplate, level)}>
              Create Custom Template
            </Link>
          </>
        ) : null}
        <span aria-hidden> &gt; </span>
        <span className={styles.breadcrumbCurrent}>Review & Save</span>
      </p>

      <div className={styles.body}>
        <CreateRoleStepper
          currentStepId="review"
          completedThrough={2}
          customTemplate={isTemplateFlow}
        />

        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h2 className={styles.sectionCardTitle}>
              {isTemplateFlow ? 'Template Summary' : 'Role Summary'}
            </h2>
            <Link
              href={permissionsEditHref}
              className={styles.editBtn}
              aria-label="Edit role summary"
            >
              <Pencil size={14} />
            </Link>
          </div>
          <div className={styles.summaryGrid3}>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>
                {isTemplateFlow ? 'Template Name' : 'Role Name'}
              </p>
              <p className={styles.summaryValue}>{roleName || 'Branch Manager'}</p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Description</p>
              <p className={styles.summaryValue}>
                {description || 'Manages staff and inventory at a specific branch level.'}
              </p>
            </div>
            <div className={styles.summaryItem}>
              <p className={styles.summaryLabel}>Template</p>
              <p className={styles.summaryValue}>
                {isTemplateFlow ? 'Custom Template' : (template?.title ?? 'Branch Manager')}
              </p>
            </div>
          </div>
        </section>

        <PermissionsReviewGrid permissionGroups={permissionGroups} editHref={permissionsEditHref} />

        {submitError ? (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        ) : null}
      </div>

      <FooterActions
        left={
          <Link href={permissionsBackHref} className={styles.secondaryBtn}>
            Back
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isTemplateFlow ? 'Save Template' : 'Create Role'}
          </button>
        }
      />
    </div>
  );
}

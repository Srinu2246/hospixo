'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { WizardLayout, WizardStepper } from '@/components/shell';
import { getCompanyStatesForCountry } from '@/constants/admin/company-create-catalog';
import {
  billingCycleOptions,
  organizationBillingCountryOptions,
  organizationCreateCopy,
  organizationCreateSteps,
  resolveOrganizationCountryCode,
  taxRegistrationStatusOptions,
} from '@/constants/admin/organization-create';
import { routes } from '@/constants/routes';
import { useOrganizationCreate } from '@/context/organization-create';
import { SelectField, TextField, companyFormStyles } from '@/components/form/wizard-shared';
import { useFieldErrors } from '@/hooks/use-field-errors';
import type {
  OrganizationCreateFormData,
  PaymentMethodCatalogEntry,
  SubscriptionPlanCatalogEntry,
} from '@/types/organization-create';

import { useSaveOrganizationDraft } from '../../lib/use-save-draft';
import { isOrganizationCreateStepBlocked } from '../../lib/validation';
import {
  canContinueOrganizationCommercial,
  organizationAdminSchema,
  organizationCommercialSchema,
} from '../../lib/validation';
import { OrganizationCreateActions } from '../organization-create-actions/organization-create-actions';

import styles from './organization-commercial-step.module.css';

type AdminField = 'firstName' | 'lastName' | 'email' | 'phone';

type CommercialField =
  | 'planPublicId'
  | 'billingCycle'
  | 'legalName'
  | 'billingCountryCode'
  | 'billingStateCode'
  | 'taxRegistrationStatus'
  | 'taxRegistrationNumber'
  | 'paymentMethodCode';

function planOptionLabel(plan: SubscriptionPlanCatalogEntry): string {
  const priceLabel = plan.price ? ` — from ${plan.currency} ${plan.price}` : '';
  return `${plan.name}${priceLabel}`;
}

function isTaxNumberValidationActive(
  taxRegistrationStatus: OrganizationCreateFormData['commercial']['taxRegistrationStatus'],
  taxRegistrationNumber: string,
): boolean {
  return taxRegistrationStatus === 'registered' || taxRegistrationNumber.trim().length > 0;
}

type OrganizationCommercialStepProps = Readonly<{
  plans: readonly SubscriptionPlanCatalogEntry[];
  paymentMethods: readonly PaymentMethodCatalogEntry[];
}>;

export function OrganizationCommercialStep({
  plans,
  paymentMethods,
}: OrganizationCommercialStepProps) {
  const router = useRouter();
  const { data, updateSection } = useOrganizationCreate();
  const { admin, commercial, details } = data;
  const prevPath = organizationCreateSteps[0].path;
  const nextPath = organizationCreateSteps[2].path;
  const { saveDraft, savingDraft, draftMessage, draftOk } = useSaveOrganizationDraft();

  const {
    errors: adminErrors,
    validate: validateAdmin,
    clearError: clearAdminError,
    validateField: validateAdminField,
  } = useFieldErrors<AdminField>();
  const {
    errors: commercialErrors,
    validate: validateCommercial,
    clearError: clearCommercialError,
    validateField: validateCommercialField,
    validateSchemaField: validateCommercialSchemaField,
  } = useFieldErrors<CommercialField>();

  const billingStateOptions = useMemo(
    () => getCompanyStatesForCountry(commercial.billingCountryCode),
    [commercial.billingCountryCode],
  );

  useEffect(() => {
    if (commercial.billingCountryCode.trim()) return;
    const countryCode = resolveOrganizationCountryCode(details.country);
    if (!countryCode) return;
    updateSection('commercial', { billingCountryCode: countryCode });
  }, [commercial.billingCountryCode, details.country, updateSection]);
  const catalogsReady = plans.length > 0 && paymentMethods.length > 0;
  const canContinue = canContinueOrganizationCommercial({ admin, commercial });
  const primaryDisabled = isOrganizationCreateStepBlocked(canContinue, {
    savingDraft,
    catalogsReady,
  });
  const isTaxRegistered = commercial.taxRegistrationStatus === 'registered';

  function updateCommercial(patch: Partial<OrganizationCreateFormData['commercial']>) {
    updateSection('commercial', patch);
    return { ...commercial, ...patch };
  }

  function handleNext() {
    if (savingDraft) return;
    const adminValid = validateAdmin(organizationAdminSchema, admin);
    const commercialValid = validateCommercial(organizationCommercialSchema, commercial);
    if (!adminValid || !commercialValid) return;
    router.push(nextPath);
  }

  return (
    <WizardLayout
      title=""
      cardTitle={organizationCreateCopy.commercialTitle}
      stepper={
        <WizardStepper
          steps={organizationCreateSteps}
          currentStepId="commercial"
          ariaLabel="Organization creation progress"
        />
      }
      footer={
        <OrganizationCreateActions
          showBack
          backHref={prevPath}
          cancelHref={routes.admin.organizations}
          primaryLabel={organizationCreateCopy.nextReview}
          onPrimary={handleNext}
          primaryDisabled={primaryDisabled}
          onSaveDraft={saveDraft}
          saveDraftLabel={
            savingDraft ? organizationCreateCopy.savingDraft : organizationCreateCopy.saveDraft
          }
          saveDraftDisabled={savingDraft}
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
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{organizationCreateCopy.adminSectionTitle}</h3>
        <p className={styles.sectionSubtitle}>{organizationCreateCopy.adminSectionSubtitle}</p>
        <div className={companyFormStyles.grid}>
          <TextField
            label="First Name"
            required
            autoFocus
            placeholder="e.g. John"
            value={admin.firstName}
            error={adminErrors.firstName}
            onChange={(e) => {
              const value = e.target.value;
              updateSection('admin', { firstName: value });
              if (value.trim()) {
                validateAdminField(organizationAdminSchema, 'firstName', value);
              } else {
                clearAdminError('firstName');
              }
            }}
          />
          <TextField
            label="Last Name"
            required
            placeholder="e.g. Smith"
            value={admin.lastName}
            error={adminErrors.lastName}
            onChange={(e) => {
              const value = e.target.value;
              updateSection('admin', { lastName: value });
              if (value.trim()) {
                validateAdminField(organizationAdminSchema, 'lastName', value);
              } else {
                clearAdminError('lastName');
              }
            }}
          />
          <TextField
            label="Email Address"
            required
            type="email"
            placeholder="john.smith@hotel.com"
            hint="Format: name@domain.com"
            value={admin.email}
            error={adminErrors.email}
            onChange={(e) => {
              const value = e.target.value;
              updateSection('admin', { email: value });
              if (value.trim()) {
                validateAdminField(organizationAdminSchema, 'email', value);
              } else {
                clearAdminError('email');
              }
            }}
          />
          <TextField
            label="Phone Number"
            required
            className={companyFormStyles.gridFull}
            placeholder="+14155552671"
            hint="E.164 format, e.g. +14155552671"
            value={admin.phone}
            error={adminErrors.phone}
            onChange={(e) => {
              const value = e.target.value;
              updateSection('admin', { phone: value });
              if (value.trim()) {
                validateAdminField(organizationAdminSchema, 'phone', value);
              } else {
                clearAdminError('phone');
              }
            }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{organizationCreateCopy.subscriptionSectionTitle}</h3>
        <div className={companyFormStyles.grid}>
          <SelectField
            label="Plan"
            required
            disabled={plans.length === 0}
            options={plans.map((plan) => ({
              label: planOptionLabel(plan),
              value: plan.code,
            }))}
            value={commercial.planPublicId}
            error={
              commercialErrors.planPublicId ??
              (plans.length === 0
                ? 'No active plans available. Please try again shortly.'
                : undefined)
            }
            onValueChange={(value) => {
              clearCommercialError('planPublicId');
              updateSection('commercial', { planPublicId: value });
            }}
          />
          <SelectField
            label="Billing Cycle"
            required
            options={[...billingCycleOptions]}
            value={commercial.billingCycle}
            error={commercialErrors.billingCycle}
            onValueChange={(value) => {
              clearCommercialError('billingCycle');
              updateSection('commercial', { billingCycle: value });
            }}
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={commercial.sendWelcomeEmail}
            onChange={(e) =>
              updateSection('commercial', {
                sendWelcomeEmail: e.target.checked,
              })
            }
          />
          <span>{organizationCreateCopy.sendWelcomeEmail}</span>
        </label>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{organizationCreateCopy.billingSectionTitle}</h3>
        <div className={companyFormStyles.grid}>
          <TextField
            label="Legal Entity Name"
            required
            placeholder="e.g. ABC Hospitality Group LLC"
            value={commercial.legalName}
            error={commercialErrors.legalName}
            onChange={(e) => {
              const value = e.target.value;
              updateSection('commercial', { legalName: value });
              if (value.trim()) {
                validateCommercialField(organizationCommercialSchema, 'legalName', value);
              } else {
                clearCommercialError('legalName');
              }
            }}
          />
          <SelectField
            label="Billing Country"
            required
            options={[...organizationBillingCountryOptions]}
            value={commercial.billingCountryCode}
            error={commercialErrors.billingCountryCode}
            onValueChange={(value) => {
              clearCommercialError('billingCountryCode');
              const nextCommercial = updateCommercial({
                billingCountryCode: value,
                billingStateCode: '',
              });
              validateCommercialSchemaField(
                organizationCommercialSchema,
                nextCommercial,
                'billingStateCode',
              );
            }}
          />
          {billingStateOptions.length > 0 ? (
            <SelectField
              label="State / Region"
              required
              options={billingStateOptions.map((state) => ({
                label: state.label,
                value: state.code,
              }))}
              value={commercial.billingStateCode}
              error={commercialErrors.billingStateCode}
              onValueChange={(value) => {
                const nextCommercial = updateCommercial({
                  billingStateCode: value,
                });
                validateCommercialSchemaField(
                  organizationCommercialSchema,
                  nextCommercial,
                  'billingStateCode',
                );
              }}
            />
          ) : (
            <TextField
              label="State / Region Code"
              required
              placeholder="e.g. LND"
              value={commercial.billingStateCode}
              error={commercialErrors.billingStateCode}
              onChange={(e) => {
                const billingStateCode = e.target.value.toUpperCase();
                const nextCommercial = updateCommercial({ billingStateCode });
                if (billingStateCode.trim()) {
                  validateCommercialSchemaField(
                    organizationCommercialSchema,
                    nextCommercial,
                    'billingStateCode',
                  );
                } else {
                  clearCommercialError('billingStateCode');
                }
              }}
            />
          )}
          <SelectField
            label="Tax Registration Status"
            required
            options={[...taxRegistrationStatusOptions]}
            value={commercial.taxRegistrationStatus}
            error={commercialErrors.taxRegistrationStatus}
            onValueChange={(value) => {
              clearCommercialError('taxRegistrationStatus');
              const taxRegistrationStatus = value as typeof commercial.taxRegistrationStatus;
              const nextCommercial = updateCommercial({
                taxRegistrationStatus,
                taxRegistrationNumber:
                  taxRegistrationStatus === 'registered' ? commercial.taxRegistrationNumber : '',
              });
              validateCommercialSchemaField(
                organizationCommercialSchema,
                nextCommercial,
                'taxRegistrationNumber',
              );
            }}
          />
          <TextField
            label="Tax Registration Number"
            required={isTaxRegistered}
            placeholder="e.g. TAX-2024-001234"
            value={commercial.taxRegistrationNumber}
            error={commercialErrors.taxRegistrationNumber}
            onChange={(e) => {
              const taxRegistrationNumber = e.target.value;
              const nextCommercial = updateCommercial({
                taxRegistrationNumber,
              });
              if (
                isTaxNumberValidationActive(commercial.taxRegistrationStatus, taxRegistrationNumber)
              ) {
                validateCommercialSchemaField(
                  organizationCommercialSchema,
                  nextCommercial,
                  'taxRegistrationNumber',
                );
              } else {
                clearCommercialError('taxRegistrationNumber');
              }
            }}
          />
          <SelectField
            label="Payment Method Code"
            required
            disabled={paymentMethods.length === 0}
            options={paymentMethods.map((method) => ({
              label: method.name,
              value: method.code,
            }))}
            value={commercial.paymentMethodCode}
            error={
              commercialErrors.paymentMethodCode ??
              (paymentMethods.length === 0
                ? 'No payment methods available. Please try again shortly.'
                : undefined)
            }
            onValueChange={(value) => {
              clearCommercialError('paymentMethodCode');
              updateSection('commercial', { paymentMethodCode: value });
            }}
          />
        </div>
      </section>
    </WizardLayout>
  );
}

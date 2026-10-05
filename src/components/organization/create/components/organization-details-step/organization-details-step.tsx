'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

import { WizardLayout, WizardStepper } from '@/components/shell';
import {
  organizationCountryOptions,
  organizationCreateCopy,
  organizationCreateSteps,
  organizationCurrencyOptions,
  organizationTimezoneOptions,
  resolveOrganizationCountryCode,
} from '@/constants/admin/organization-create';
import { routes } from '@/constants/routes';
import { useOrganizationCreate } from '@/context/organization-create';
import { SelectField, TextField, companyFormStyles } from '@/components/form/wizard-shared';
import { useFieldErrors } from '@/hooks/use-field-errors';

import { uploadOrganizationLogo } from '../../lib/upload-organization-logo';
import { useSaveOrganizationDraft } from '../../lib/use-save-draft';
import { isOrganizationCreateStepBlocked } from '../../lib/validation';
import { canContinueOrganizationDetails, organizationDetailsSchema } from '../../lib/validation';
import { OrganizationCreateActions } from '../organization-create-actions/organization-create-actions';

import styles from './organization-details-step.module.css';

type DetailsField = 'name' | 'country' | 'city' | 'timezone' | 'baseCurrency';

export function OrganizationDetailsStep() {
  const router = useRouter();
  const { data, updateSection } = useOrganizationCreate();
  const { details } = data;
  const nextPath = organizationCreateSteps[1].path;
  const { errors, validate, clearError, validateField } = useFieldErrors<DetailsField>();
  const { saveDraft, savingDraft, draftMessage, draftOk } = useSaveOrganizationDraft();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const primaryDisabled = isOrganizationCreateStepBlocked(canContinueOrganizationDetails(details), {
    savingDraft,
  });

  function handleTextFieldChange(field: 'name' | 'city', value: string) {
    updateSection('details', { [field]: value });
    if (value.trim()) {
      validateField(organizationDetailsSchema, field, value);
    } else {
      clearError(field);
    }
  }

  function handleNext() {
    if (savingDraft) return;
    if (!validate(organizationDetailsSchema, details)) return;
    router.push(nextPath);
  }

  async function handleLogoSelected(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    setUploadingLogo(true);
    try {
      const result = await uploadOrganizationLogo(file);
      updateSection('details', {
        logoAssetId: result.assetId,
        logoFileName: result.filename,
        logoPreviewUrl: result.displayUrl,
      });
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : organizationCreateCopy.logoUploadError);
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <WizardLayout
      title=""
      cardTitle={organizationCreateCopy.detailsTitle}
      stepper={
        <WizardStepper
          steps={organizationCreateSteps}
          currentStepId="details"
          ariaLabel="Organization creation progress"
        />
      }
      footer={
        <OrganizationCreateActions
          cancelHref={routes.admin.organizations}
          primaryLabel={organizationCreateCopy.nextCommercial}
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
      <p className={styles.intro}>{organizationCreateCopy.detailsSubtitle}</p>
      <div className={companyFormStyles.grid}>
        <TextField
          label="Organization Name"
          required
          autoFocus
          placeholder="e.g. ABC Hospitality Group"
          value={details.name}
          error={errors.name}
          onChange={(e) => handleTextFieldChange('name', e.target.value)}
        />
        <SelectField
          label="Country"
          required
          options={organizationCountryOptions.map((o) => ({
            label: o,
            value: o,
          }))}
          value={details.country}
          error={errors.country}
          onValueChange={(value) => {
            clearError('country');
            updateSection('details', { country: value });
            updateSection('commercial', {
              billingCountryCode: resolveOrganizationCountryCode(value),
              billingStateCode: '',
            });
            if (value.trim()) {
              validateField(organizationDetailsSchema, 'country', value);
            }
          }}
        />
        <TextField
          label="City"
          required
          placeholder="Enter city name"
          value={details.city}
          error={errors.city}
          onChange={(e) => handleTextFieldChange('city', e.target.value)}
        />
        <SelectField
          label="Timezone"
          required
          options={organizationTimezoneOptions.map((o) => ({
            label: o,
            value: o,
          }))}
          value={details.timezone}
          error={errors.timezone}
          onValueChange={(value) => {
            clearError('timezone');
            updateSection('details', { timezone: value });
            if (value.trim()) {
              validateField(organizationDetailsSchema, 'timezone', value);
            }
          }}
        />
        <SelectField
          label="Base Currency"
          required
          options={organizationCurrencyOptions.map((o) => ({
            label: o,
            value: o,
          }))}
          value={details.baseCurrency}
          error={errors.baseCurrency}
          onValueChange={(value) => {
            clearError('baseCurrency');
            updateSection('details', { baseCurrency: value });
            if (value.trim()) {
              validateField(organizationDetailsSchema, 'baseCurrency', value);
            }
          }}
        />
      </div>

      <div className={styles.uploadSection}>
        <p className={styles.uploadLabel}>Organization Logo</p>
        <label className={styles.uploadZone}>
          <input
            type="file"
            accept="image/*"
            className={styles.uploadInput}
            disabled={uploadingLogo}
            onChange={(e) => {
              void handleLogoSelected(e.target.files?.[0]);
            }}
          />
          <Upload className={styles.uploadIcon} aria-hidden />
          <span className={styles.uploadText}>
            {uploadingLogo
              ? organizationCreateCopy.uploadingLogo
              : (details.logoFileName ?? 'Click to upload or drag and drop logo (Max 2MB)')}
          </span>
        </label>
        {logoError ? (
          <p className={styles.uploadError} role="alert">
            {logoError}
          </p>
        ) : null}
      </div>
    </WizardLayout>
  );
}

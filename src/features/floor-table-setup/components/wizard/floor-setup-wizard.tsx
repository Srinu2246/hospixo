'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { useDashboardData } from '@/context/dashboard-data';
import { useDashboardFilter } from '@/context/dashboard-filter';
import { EditTableModal } from '@/features/floor-table-setup/components/detail/table-edit-modals';
import { FloorCreationStep } from '@/features/floor-table-setup/components/wizard/floor-creation-step';
import { ReviewStep } from '@/features/floor-table-setup/components/wizard/review-step';
import { SectionCreationStep } from '@/features/floor-table-setup/components/wizard/section-creation-step';
import { SectionModal } from '@/features/floor-table-setup/components/wizard/section-modal';
import { SuccessStep } from '@/features/floor-table-setup/components/wizard/success-step';
import { TableCreationStep } from '@/features/floor-table-setup/components/wizard/table-creation-step';
import { TableModal } from '@/features/floor-table-setup/components/wizard/table-modals';
import { WizardFooter } from '@/features/floor-table-setup/components/wizard/wizard-footer';
import { WizardTabs } from '@/features/floor-table-setup/components/wizard/wizard-tabs';
import {
  floorTableSetupCopy,
  sectionCodePrefix,
  wizardCopy,
  wizardSteps,
} from '@/features/floor-table-setup/config';
import {
  buildBulkCreateTablesInput,
  buildCreateFloorInput,
  buildCreateSectionInput,
  buildUpdateFloorInput,
  buildUpdateSectionInput,
  buildUpdateTableInputFromEdit,
  createEmptyDraft,
  filterByQuery,
  floorTableSetupPath,
  floorToSetupDraft,
  generateTables,
  isInternalItemsError,
  isPasswordChangeRequiredError,
  nextEntityCode,
  nextTableNumber,
  parseTableSectionChoice,
  profileChangePasswordPath,
  validateTableNumberRange,
} from '@/features/floor-table-setup/lib';
import {
  useActiveBranchId,
  useFloorBranchOutletId,
} from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import {
  archiveSectionAction,
  archiveTableAction,
  bulkCreateTablesAction,
  createFloorAction,
  createSectionAction,
  loadFloorWizardDataAction,
  updateFloorAction,
  updateSectionAction,
  updateTableAction,
} from '@/lib/floors-actions';
import { createFloorFormSchema } from '@/lib/validation/floors';
import type {
  Floor,
  FloorSetupDraft,
  FloorTableItem,
  TableDraft,
  WizardStepId,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';
import innerStyles from '../shared/workspace-page-inner.module.css';

const stepOrder = wizardSteps.map((step) => step.id);

type FloorFieldErrors = Partial<Record<'name' | 'code' | 'description' | 'branch', string>>;

export function FloorSetupWizard() {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const { hasHydrated, outletId: filterOutletId } = useDashboardFilter();
  const { data: dashboardData } = useDashboardData();
  const selectedBranchId = useActiveBranchId();
  const outletId = useFloorBranchOutletId();
  const selectedOutletName =
    dashboardData?.outlets.find((outlet) => outlet.id === filterOutletId)?.name ??
    dashboardData?.outlets.find((outlet) => outlet.id === String(selectedBranchId))?.name ??
    '';
  const actionScope = selectedBranchId
    ? { activeBranchId: selectedBranchId, preferredBranchId: selectedBranchId }
    : null;

  const urlFloorId = searchParams.get('floorId');
  const [step, setStep] = useState<WizardStepId>('floor');
  const [done, setDone] = useState(false);
  const [savedFloor, setSavedFloor] = useState<Floor | null>(null);
  const [persistedFloorId, setPersistedFloorId] = useState<string | null>(urlFloorId);
  const [draft, setDraft] = useState<FloorSetupDraft>(createEmptyDraft);
  const [sectionQuery, setSectionQuery] = useState('');
  const [tableQuery, setTableQuery] = useState('');
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionEditingId, setSectionEditingId] = useState<string | null>(null);
  const [tableMode, setTableMode] = useState<'single' | 'bulk' | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FloorFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadedFloorRef = useRef<string | null>(null);

  const visibleSections = useMemo(
    () =>
      filterByQuery(draft.sections, sectionQuery, (section) => `${section.name} ${section.code}`),
    [draft.sections, sectionQuery],
  );

  const visibleTables = useMemo(
    () => filterByQuery(draft.tables, tableQuery, (table) => table.number),
    [draft.tables, tableQuery],
  );

  const syncWizardUrl = useCallback(
    (nextFloorId?: string | null) => {
      if (!outletId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('outlet', outletId);
      if (nextFloorId) params.set('floorId', nextFloorId);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [outletId, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!hasHydrated || selectedBranchId == null) return;
    if (searchParams.get('outlet') || searchParams.get('branch_id')) return;
    syncWizardUrl(persistedFloorId);
  }, [hasHydrated, persistedFloorId, searchParams, selectedBranchId, syncWizardUrl]);

  const hydrateFromServer = useCallback(
    async (floorId: string) => {
      if (!actionScope) {
        setSubmitError(wizardCopy.branchRequired);
        return false;
      }
      const result = await loadFloorWizardDataAction(floorId, actionScope);
      if (!result.ok) {
        setSubmitError(result.message);
        return false;
      }
      setSavedFloor(result.floor);
      setDraft(floorToSetupDraft(result.floor));
      setPersistedFloorId(result.floor.id);
      loadedFloorRef.current = result.floor.id;
      return true;
    },
    [actionScope],
  );

  useEffect(() => {
    if (!outletId || !urlFloorId || loadedFloorRef.current === urlFloorId) return;
    loadedFloorRef.current = urlFloorId;
    setPersistedFloorId(urlFloorId);
    void hydrateFromServer(urlFloorId);
  }, [hydrateFromServer, outletId, urlFloorId]);

  function validateFloorForm() {
    if (!outletId) {
      setFieldErrors((current) => ({ ...current, branch: wizardCopy.branchRequired }));
      setSubmitError(wizardCopy.branchRequired);
      setStep('floor');
      return false;
    }
    const parsed = createFloorFormSchema.safeParse(draft.floor);
    if (parsed.success) {
      setFieldErrors({});
      return true;
    }

    const nextErrors: FloorFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key === 'name' || key === 'code' || key === 'description') {
        nextErrors[key] ??= issue.message;
      }
    }
    setFieldErrors(nextErrors);
    setStep('floor');
    return false;
  }

  async function persistFloor(): Promise<string | null> {
    if (!actionScope || !outletId) {
      setSubmitError(wizardCopy.branchRequired);
      return null;
    }
    if (!validateFloorForm()) return null;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (persistedFloorId) {
        const updated = await updateFloorAction(
          persistedFloorId,
          buildUpdateFloorInput(draft.floor, savedFloor?.version ?? 1),
          actionScope,
        );
        if (!updated.ok) {
          if (updated.fieldErrors) {
            setFieldErrors(updated.fieldErrors);
            setStep('floor');
          }
          setSubmitError(updated.message ?? 'Unable to update floor.');
          return null;
        }
        await hydrateFromServer(persistedFloorId);
        return persistedFloorId;
      }

      const created = await createFloorAction(buildCreateFloorInput(draft.floor), actionScope);
      if (!created.ok) {
        if (created.fieldErrors) {
          setFieldErrors(created.fieldErrors);
          setStep('floor');
        }
        setSubmitError(created.message ?? 'Unable to create floor.');
        return null;
      }
      if (created.id == null || created.id === '') {
        setSubmitError('Unable to create floor.');
        return null;
      }
      setPersistedFloorId(created.id);
      loadedFloorRef.current = created.id;
      syncWizardUrl(created.id);
      await hydrateFromServer(created.id);
      return created.id;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save floor.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openReview() {
    const floorId = persistedFloorId ?? (await persistFloor());
    if (!floorId) return;
    setIsSubmitting(true);
    try {
      const ok = await hydrateFromServer(floorId);
      if (ok) {
        setSubmitError(null);
        setStep('review');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function goToStep(next: WizardStepId) {
    if (isSubmitting) return;
    if (next !== 'floor' && !persistedFloorId) {
      const floorId = await persistFloor();
      if (!floorId) return;
    }
    if (next === 'review') {
      await openReview();
      return;
    }
    if (persistedFloorId) {
      setIsSubmitting(true);
      try {
        await hydrateFromServer(persistedFloorId);
      } finally {
        setIsSubmitting(false);
      }
    }
    setStep(next);
  }

  function goBack() {
    if (isSubmitting) return;
    const index = stepOrder.indexOf(step);
    if (index <= 0) {
      router.push(floorTableSetupPath(outletId));
      return;
    }
    void goToStep(stepOrder[index - 1] ?? 'floor');
  }

  async function goNext() {
    if (step === 'floor') {
      const floorId = await persistFloor();
      if (!floorId) return;
      setStep('section');
      return;
    }
    if (step === 'review') {
      setDone(true);
      return;
    }
    const index = stepOrder.indexOf(step);
    const next = stepOrder[index + 1] ?? 'review';
    if (next === 'review') {
      await openReview();
      return;
    }
    setStep(next);
  }

  async function persistSection(
    floorId: string,
    input: {
      name: string;
      code: string;
      description: string;
      active: boolean;
    },
  ) {
    if (!actionScope) {
      setSubmitError(wizardCopy.branchRequired);
      return false;
    }
    const created = await createSectionAction(floorId, buildCreateSectionInput(input), actionScope);
    if (!created.ok || !created.id) {
      setSubmitError(created.message ?? 'Unable to create section.');
      return false;
    }
    await hydrateFromServer(floorId);
    return created.id;
  }

  async function createSection(input: {
    name: string;
    code: string;
    description: string;
    active: boolean;
  }) {
    const floorId = persistedFloorId ?? (await persistFloor());
    if (!floorId) return false;
    return persistSection(floorId, input);
  }

  async function updateSection(
    sectionId: string,
    input: {
      name: string;
      code: string;
      description: string;
      active: boolean;
    },
  ) {
    const floorId = persistedFloorId;
    if (!floorId || !actionScope) {
      setSubmitError(wizardCopy.branchRequired);
      return false;
    }
    const section = draft.sections.find((item) => item.id === sectionId);
    const updated = await updateSectionAction(
      floorId,
      sectionId,
      buildUpdateSectionInput(input, section?.version ?? 1),
      actionScope,
    );
    if (!updated.ok) {
      setSubmitError(updated.message ?? 'Unable to update section.');
      return false;
    }
    await hydrateFromServer(floorId);
    return true;
  }

  function draftTableToItem(table: TableDraft): FloorTableItem | null {
    const section = draft.sections.find((item) => item.id === table.sectionId);
    if (!section) return null;
    return {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      configStatus: 'active',
      version: table.version,
      reservations: table.reservations,
      area: section.name,
      shape: 'square',
      sectionId: table.sectionId,
    };
  }

  async function updateTable(
    tableId: string,
    value: {
      number: string;
      capacity: number;
      shape: FloorTableItem['shape'];
      configStatus: FloorTableItem['configStatus'];
      reservations: boolean;
    },
  ) {
    const floorId = persistedFloorId;
    const table = draft.tables.find((item) => item.id === tableId);
    if (!floorId || !actionScope || !table?.sectionId) {
      setSubmitError(wizardCopy.branchRequired);
      return false;
    }
    const updated = await updateTableAction(
      floorId,
      table.sectionId,
      tableId,
      buildUpdateTableInputFromEdit(value, table.version ?? 0),
      actionScope,
    );
    if (!updated.ok) {
      setSubmitError(updated.message ?? 'Unable to update table.');
      return false;
    }
    await hydrateFromServer(floorId);
    setEditingTableId(null);
    return true;
  }

  async function deleteSection(sectionId: string) {
    if (!persistedFloorId || !actionScope) return;
    const section = draft.sections.find((item) => item.id === sectionId);
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const archived = await archiveSectionAction(
        persistedFloorId,
        sectionId,
        actionScope,
        section?.version ?? 1,
      );
      if (!archived.ok) {
        setSubmitError(archived.message ?? 'Unable to archive section.');
        return;
      }
      await hydrateFromServer(persistedFloorId);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createTables(value: {
    startNumber: string;
    count: number;
    capacity: number;
    reservations: boolean;
    sectionId?: string;
    newSection?: { name: string; code: string };
  }) {
    const floorId = persistedFloorId ?? (await persistFloor());
    if (!floorId || !actionScope) {
      setSubmitError(wizardCopy.branchRequired);
      return false;
    }

    const rangeCheck = validateTableNumberRange(draft.tables, value.startNumber, value.count);
    if (!rangeCheck.ok) {
      setSubmitError(rangeCheck.message);
      return false;
    }

    const choice = parseTableSectionChoice(value);
    let sectionId: string | undefined;
    if (choice.kind === 'new') {
      const createdId = await persistSection(floorId, {
        name: choice.section.name,
        code: choice.section.code,
        description: '',
        active: true,
      });
      if (!createdId) return false;
      sectionId = createdId;
    } else if (choice.kind === 'existing') {
      sectionId = choice.sectionId;
    } else {
      setSubmitError(wizardCopy.sectionRequired);
      return false;
    }

    const tables = generateTables({ ...value, existing: draft.tables });
    const created = await bulkCreateTablesAction(
      floorId,
      sectionId,
      buildBulkCreateTablesInput(tables),
      actionScope,
    );
    if (!created.ok) {
      const message = created.message ?? 'Unable to create tables.';
      if (!isInternalItemsError(message)) setSubmitError(message);
      return false;
    }
    await hydrateFromServer(floorId);
    return true;
  }

  async function deleteTable(tableId: string) {
    if (!persistedFloorId || !actionScope) return;
    const table = draft.tables.find((item) => item.id === tableId);
    const sectionId = table?.sectionId ?? draft.sections[0]?.id;
    if (!sectionId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const archived = await archiveTableAction(
        persistedFloorId,
        sectionId,
        tableId,
        actionScope,
        table?.version ?? 1,
      );
      if (!archived.ok) {
        setSubmitError(archived.message ?? 'Unable to archive this table.');
        return;
      }
      await hydrateFromServer(persistedFloorId);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleFloor(active: boolean) {
    if (!persistedFloorId || !actionScope) return;
    const updated = await updateFloorAction(
      persistedFloorId,
      buildUpdateFloorInput({ ...draft.floor, active }, savedFloor?.version ?? 1),
      actionScope,
    );
    if (!updated.ok) {
      setSubmitError(updated.message ?? 'Unable to update floor.');
      return;
    }
    await hydrateFromServer(persistedFloorId);
  }

  async function toggleSection(sectionId: string, active: boolean) {
    if (!persistedFloorId || !actionScope) return;
    const section = draft.sections.find((item) => item.id === sectionId);
    if (!section) return;
    const updated = await updateSectionAction(
      persistedFloorId,
      sectionId,
      buildUpdateSectionInput({ ...section, active }, section.version ?? 1),
      actionScope,
    );
    if (!updated.ok) {
      setSubmitError(updated.message ?? 'Unable to update section.');
      return;
    }
    await hydrateFromServer(persistedFloorId);
  }

  if (!hasHydrated) {
    return null;
  }

  if (done && outletId) {
    return (
      <section className={styles.page} aria-label={wizardCopy.successTitle}>
        <div className={innerStyles.pageInner}>
          <SuccessStep
            draft={draft}
            outletId={outletId}
            branchName={savedFloor?.branch?.trim() || selectedOutletName}
          />
        </div>
      </section>
    );
  }

  const editingTable = editingTableId
    ? draft.tables.find((item) => item.id === editingTableId)
    : undefined;

  return (
    <section className={styles.page} aria-label={wizardCopy.floorTitle}>
      <div className={innerStyles.pageInner}>
        <WizardTabs value={step} onChange={(next) => void goToStep(next)} />
        {step !== 'floor' && step !== 'review' ? (
          <div className={styles.titleRow}>
            <button
              type="button"
              className={styles.backIconButton}
              onClick={goBack}
              aria-label={wizardCopy.back}
            >
              <ArrowLeft className={styles.icon} />
            </button>
            <h1 className={styles.title}>{draft.floor.name}</h1>
          </div>
        ) : null}

        {submitError && !isInternalItemsError(submitError) ? (
          <p className={styles.formError} role="alert">
            {submitError}{' '}
            {isPasswordChangeRequiredError(submitError) ? (
              <button
                type="button"
                className={styles.editLink}
                onClick={() =>
                  router.push(profileChangePasswordPath(floorTableSetupPath(outletId)))
                }
              >
                {floorTableSetupCopy.changePassword}
              </button>
            ) : null}
          </p>
        ) : null}

        {step === 'floor' ? (
          <FloorCreationStep
            value={draft.floor}
            errors={fieldErrors}
            onChange={(floor) => {
              setDraft((current) => ({ ...current, floor }));
              setFieldErrors({});
              setSubmitError(null);
            }}
          />
        ) : null}
        {step === 'section' ? (
          <SectionCreationStep
            sections={visibleSections}
            query={sectionQuery}
            onQueryChange={setSectionQuery}
            onCreate={() => {
              setSectionEditingId(null);
              setSectionOpen(true);
            }}
            onEdit={(sectionId) => {
              setSectionEditingId(sectionId);
              setSectionOpen(true);
            }}
            onDelete={(id) => void deleteSection(id)}
          />
        ) : null}
        {step === 'table' ? (
          <TableCreationStep
            tables={visibleTables}
            query={tableQuery}
            onQueryChange={setTableQuery}
            onAdd={() => setTableMode('single')}
            onBulk={() => setTableMode('bulk')}
            onEdit={(tableId) => setEditingTableId(tableId)}
            onDelete={(id) => void deleteTable(id)}
          />
        ) : null}
        {step === 'review' ? (
          <ReviewStep
            draft={draft}
            onEdit={(next) => void goToStep(next)}
            onToggleFloor={(active) => void toggleFloor(active)}
            onToggleSection={(id, active) => void toggleSection(id, active)}
          />
        ) : null}

        <WizardFooter
          step={step}
          onBack={goBack}
          onNext={() => void goNext()}
          nextDisabled={
            isSubmitting || (step === 'floor' && (!draft.floor.name.trim() || !outletId))
          }
          backDisabled={isSubmitting}
          nextLabel={isSubmitting ? floorTableSetupCopy.creatingFloor : undefined}
        />

        <SectionModal
          open={sectionOpen}
          defaultCode={nextEntityCode(sectionCodePrefix, draft.sections)}
          initial={
            sectionEditingId
              ? (() => {
                  const section = draft.sections.find((item) => item.id === sectionEditingId);
                  if (!section) return undefined;
                  return {
                    name: section.name,
                    code: section.code,
                    description: section.description,
                    active: section.active,
                  };
                })()
              : undefined
          }
          title={sectionEditingId ? wizardCopy.edit : undefined}
          submitLabel={sectionEditingId ? wizardCopy.edit : undefined}
          onClose={() => {
            setSectionOpen(false);
            setSectionEditingId(null);
          }}
          onSubmit={(input) =>
            sectionEditingId ? updateSection(sectionEditingId, input) : createSection(input)
          }
        />
        <TableModal
          open={tableMode !== null}
          mode={tableMode ?? 'single'}
          defaultStart={nextTableNumber(draft.tables)}
          existingTables={draft.tables}
          sections={draft.sections}
          defaultSectionId={draft.sections[0]?.id}
          defaultSectionCode={nextEntityCode(sectionCodePrefix, draft.sections)}
          onClose={() => {
            setTableMode(null);
            setSubmitError(null);
          }}
          onGenerate={createTables}
        />
        <EditTableModal
          open={Boolean(editingTableId && editingTable)}
          table={editingTable ? draftTableToItem(editingTable) : null}
          areas={draft.sections.map((section) => section.name)}
          onClose={() => setEditingTableId(null)}
          onSave={(value) =>
            editingTableId
              ? updateTable(editingTableId, {
                  number: value.number,
                  capacity: value.capacity,
                  shape: value.shape,
                  configStatus: value.configStatus,
                  reservations: value.reservations,
                })
              : Promise.resolve(false)
          }
          statusError={submitError}
        />
      </div>
    </section>
  );
}

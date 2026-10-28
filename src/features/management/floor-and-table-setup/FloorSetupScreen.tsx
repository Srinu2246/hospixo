'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Loading } from '@/components/shared/ui/Loading';
import { StickyActionFooter } from '@/components/shared/ui/StickyActionFooter';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { FloorCatalog } from '@/components/features/floor-and-table-setup/FloorCatalog';
import { FloorCreationStep } from '@/components/features/floor-and-table-setup/FloorCreationStep';
import { ReviewStep } from '@/components/features/floor-and-table-setup/ReviewStep';
import { SectionStep } from '@/components/features/floor-and-table-setup/SectionStep';
import { SuccessStep } from '@/components/features/floor-and-table-setup/SuccessStep';
import { TableStep } from '@/components/features/floor-and-table-setup/TableStep';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { FloorDetailScreen } from '@/features/management/floor-and-table-setup/FloorDetailScreen';
import type {
  FloorStatusFilter,
  SavedFloor,
  SectionInput,
  WizardStep,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  buildSavedFloor,
  emptyFloor,
  floorDetailHref,
  generateTables,
  isWizardStep,
  parseFloorDetailRoute,
  removeSection,
  removeTable,
  suggestCode,
  applyBulkTableEdit,
  toggleTableActive,
  unlinkSectionTables,
  withFloorCode,
} from '@/lib/helpers/floorAndTableSetup';
import { useFloorSetupDraft } from '@/lib/hooks/floor-and-table-setup/useFloorSetupDraft';
import {
  useBulkCreateTables,
  useCreateFloor,
  useCreateSection,
  useFloors,
  useUpdateFloor,
  useUpdateSection,
} from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { useSidebarStore } from '@/stores/sidebarStore';

/** Wizard tab titles and matching sticky-footer primary labels. */
const wizardStepLabel = {
  floor: 'Floor Creation',
  section: 'Section Create',
  table: 'Table Create',
  review: 'Review',
} as const;

const wizardFooterPrimaryLabel = {
  floor: 'Save Floor',
  section: 'Save Section',
  table: 'Save Table',
  review: 'Save & Exit',
  reviewPending: 'Saving...',
} as const;

const wizardTabs = [
  { value: 'floor', label: wizardStepLabel.floor },
  { value: 'section', label: wizardStepLabel.section },
  { value: 'table', label: wizardStepLabel.table },
  { value: 'review', label: wizardStepLabel.review },
];

export function FloorSetupScreen() {
  const branchName = useSidebarStore((state) => state.context.branchName);
  const branchId = useSidebarStore((state) => state.context.branchId);
  const sessionHydrated = useSidebarStore((state) => state.sessionHydrated);
  const outlet = branchName || (branchId ? `Branch ${branchId}` : 'this outlet');
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { route, draft, ready, save, openStep } = useFloorSetupDraft();
  const { details, sections, tables, floors } = draft;
  const detail = parseFloorDetailRoute(pathname, searchParams.get('tab'));
  const [floorStatus, setFloorStatus] = useState<FloorStatusFilter>('all');
  const floorsQuery = useFloors(branchId, floorStatus);
  const persistedFloorId =
    draft.createdId && /^\d+$/.test(draft.createdId) ? Number(draft.createdId) : undefined;
  const createFloorRequest = useCreateFloor(branchId);
  const updateFloorRequest = useUpdateFloor(branchId, persistedFloorId);
  const createSectionRequest = useCreateSection(branchId);
  const updateSectionRequest = useUpdateSection(branchId);
  const bulkCreateTables = useBulkCreateTables(branchId);
  const savingFloor = createFloorRequest.isPending || updateFloorRequest.isPending;
  const floorsLoading =
    !sessionHydrated ||
    (typeof branchId === 'number' && (floorsQuery.isLoading || floorsQuery.isPending));
  const floorsError = floorsLoading
    ? null
    : branchId == null
      ? 'Select a branch to load floors.'
      : floorsQuery.isError
        ? floorsQuery.error.message
        : null;

  const [nameError, setNameError] = useState<string | null>(null);
  const [floorCanSave, setFloorCanSave] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const footerTarget = useAppShellFooterTarget();
  const theme = useTheme();
  const belowDesktop = useMediaQuery(theme.breakpoints.down('md'));

  const step: WizardStep | null = isWizardStep(route.step) ? route.step : null;
  const created = floors.find((floor) => floor.id === draft.createdId) ?? null;
  const needsFloorName = Boolean(ready && step && step !== 'floor' && !details.name.trim());
  const successWithoutFloor = Boolean(ready && route.step === 'success' && !created);

  useEffect(() => {
    if (successWithoutFloor) {
      openStep('hub');
      return;
    }
    if (needsFloorName) {
      openStep('floor');
    }
  }, [needsFloorName, openStep, successWithoutFloor]);

  const displayNameError = needsFloorName ? 'Enter a floor name.' : nameError;

  function openCreate() {
    setNameError(null);
    openStep('floor', {
      ...draft,
      details: emptyFloor(),
      sections: [],
      tables: [],
      createdId: null,
      floorVersion: null,
    });
  }

  function openSaved(floor: SavedFloor) {
    setNameError(null);
    openStep('review', {
      ...draft,
      details: floor.details,
      sections: floor.sections,
      tables: floor.tables,
      createdId: floor.id,
    });
  }

  function goToStep(next: WizardStep) {
    if (next !== 'floor' && persistedFloorId == null) {
      setCreateError('Save the floor before continuing.');
      openStep('floor');
      return;
    }
    if (next !== 'floor' && !details.name.trim()) {
      setNameError('Enter a floor name.');
      openStep('floor');
      return;
    }
    setNameError(null);
    openStep(next, {
      ...draft,
      details: next === 'floor' ? details : { ...withFloorCode(details), active: true },
    });
  }

  async function saveFloorStep() {
    if (!details.name.trim()) {
      setNameError('Enter a floor name.');
      openStep('floor');
      return;
    }
    if (branchId == null) {
      setCreateError('Select a branch before creating a floor.');
      return;
    }
    setNameError(null);
    setCreateError(null);
    const nextDetails = { ...withFloorCode(details), active: true };
    try {
      if (persistedFloorId == null) {
        const created = await createFloorRequest.mutateAsync({
          name: nextDetails.name,
          description: nextDetails.description,
          sort_order: 0,
          code: nextDetails.code,
        });
        openStep('section', {
          ...draft,
          details: nextDetails,
          createdId: String(created.id),
          floorVersion: created.version ?? 0,
        });
        return;
      }
      const updated = await updateFloorRequest.mutateAsync({
        name: nextDetails.name,
        description: nextDetails.description,
        sort_order: 0,
        status: 'active',
        version: draft.floorVersion ?? 0,
        code: nextDetails.code,
      });
      openStep('section', {
        ...draft,
        details: nextDetails,
        floorVersion: updated.version ?? draft.floorVersion ?? 0,
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create this floor.');
    }
  }

  async function saveSection(input: SectionInput, id?: string): Promise<boolean> {
    if (persistedFloorId == null) {
      setCreateError('Save the floor before adding a section.');
      return false;
    }
    const code =
      input.code.trim() || suggestCode(input.name, (id ? 0 : sections.length) + 1, 'SEC');
    const sortOrder = id
      ? Math.max(
          0,
          sections.findIndex((section) => section.id === id),
        )
      : sections.length;
    const body = {
      name: input.name.trim(),
      description: input.description.trim(),
      sort_order: sortOrder,
      code,
    };
    try {
      if (!id) {
        const created = await createSectionRequest.mutateAsync({
          floorId: persistedFloorId,
          body,
        });
        save({
          ...draft,
          sections: [
            ...sections,
            {
              id: String(created.id),
              name: body.name,
              code: created.code ?? code,
              description: body.description,
              active: true,
              version: created.version ?? 0,
            },
          ],
        });
        return true;
      }
      const current = sections.find((section) => section.id === id);
      if (current && /^\d+$/.test(current.id)) {
        const updated = await updateSectionRequest.mutateAsync({
          floorId: persistedFloorId,
          sectionId: Number(current.id),
          body: {
            ...body,
            status: input.active ? 'active' : 'inactive',
            version: current.version ?? 0,
          },
        });
        save({
          ...draft,
          sections: sections.map((section) =>
            section.id === id
              ? {
                  ...section,
                  name: body.name,
                  code: updated.code ?? code,
                  description: body.description,
                  active: input.active,
                  version: updated.version ?? section.version,
                }
              : section,
          ),
        });
        return true;
      }
      return false;
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not save this section.');
      return false;
    }
  }

  async function saveTables(input: Parameters<typeof generateTables>[0]) {
    if (persistedFloorId == null) {
      const message = 'Save the floor before adding tables.';
      setCreateError(message);
      throw new Error(message);
    }
    const sectionIds = sections.map((section) => section.id).filter((id) => /^\d+$/.test(id));
    if (sectionIds.length === 0) {
      const message = 'Save a section before adding tables.';
      setCreateError(message);
      throw new Error(message);
    }
    const created = generateTables({ ...input, count: input.count || 1 }, tables, sectionIds);
    const groups = new Map<number, typeof created>();
    for (const table of created) {
      const sectionId = Number(table.sectionId);
      if (!Number.isFinite(sectionId)) continue;
      groups.set(sectionId, [...(groups.get(sectionId) ?? []), table]);
    }
    const savedTables = [...tables];
    for (const [sectionId, group] of groups) {
      const records = await bulkCreateTables.mutateAsync({
        floorId: persistedFloorId,
        sectionId,
        body: {
          items: group.map((table, index) => ({
            name: table.number,
            description: '',
            capacity: table.seats,
            sort_order: tables.length + index,
          })),
        },
      });
      records.forEach((record, index) => {
        const table = group[index];
        if (!table) return;
        savedTables.push({
          ...table,
          id: String(record.id),
          number: record.name,
          seats: record.capacity ?? table.seats,
          active: true,
          sectionId: String(sectionId),
        });
      });
    }
    save({ ...draft, tables: savedTables });
  }

  function finishWizard() {
    if (persistedFloorId == null) {
      setCreateError('Save the floor before finishing.');
      openStep('floor');
      return;
    }
    const saved = buildSavedFloor({ ...withFloorCode(details), active: true }, sections, tables);
    openStep('success', {
      ...draft,
      floors: [
        { ...saved, id: String(persistedFloorId) },
        ...floors.filter((floor) => floor.id !== String(persistedFloorId)),
      ],
      createdId: String(persistedFloorId),
    });
  }

  const showWizardPrimary =
    step === 'floor' ||
    (step === 'section' && sections.length > 0) ||
    (step === 'table' && tables.length > 0) ||
    step === 'review';

  const wizardPrimaryLabel =
    step === 'floor'
      ? wizardFooterPrimaryLabel.floor
      : step === 'section'
        ? wizardFooterPrimaryLabel.section
        : step === 'table'
          ? wizardFooterPrimaryLabel.table
          : savingFloor
            ? wizardFooterPrimaryLabel.reviewPending
            : wizardFooterPrimaryLabel.review;

  function goBackWizard() {
    if (!step) return;
    if (step === 'floor') openStep('hub');
    else if (step === 'section') openStep('floor');
    else if (step === 'table') openStep('section');
    else openStep('table');
  }

  function goNextWizard() {
    if (!step) return;
    if (step === 'floor') void saveFloorStep();
    else if (step === 'section') goToStep('table');
    else if (step === 'table') goToStep('review');
    else finishWizard();
  }

  const footer =
    step && ready ? (
      <>
        <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
          <StickyActionFooter
            onBack={goBackWizard}
            showPrimary={showWizardPrimary}
            primaryLabel={wizardPrimaryLabel}
            primaryDisabled={(step === 'floor' && !floorCanSave) || savingFloor}
            primaryLoading={savingFloor}
            onPrimary={goNextWizard}
          />
        </Box>
        <Stack
          component="footer"
          direction="row"
          spacing={1.5}
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: '100%',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <ActionButton variant="outlined" onClick={goBackWizard}>
            Back
          </ActionButton>
          {showWizardPrimary ? (
            <ActionButton
              disabled={(step === 'floor' && !floorCanSave) || savingFloor}
              loading={savingFloor}
              onClick={goNextWizard}
            >
              {wizardPrimaryLabel}
            </ActionButton>
          ) : null}
        </Stack>
      </>
    ) : null;

  if (detail) {
    return (
      <FloorDetailScreen
        key={detail.floorId}
        floorId={detail.floorId}
        branchId={branchId}
        branchName={branchName || (branchId ? `Branch ${branchId}` : '—')}
        detail={detail}
        base={route.base}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: { xs: '100%', sm: 720, md: '100%' },
        mx: { xs: 'auto', md: 0 },
        minHeight: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          width: '100%',
          gap: { xs: 2.5, md: 2.5 },
          pb: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {route.step === 'hub' ? (
          <FloorCatalog
            floors={floorsQuery.data ?? []}
            isLoading={floorsLoading}
            error={floorsError}
            status={floorStatus}
            onStatusChange={setFloorStatus}
            onCreate={openCreate}
            onOpen={(floor, tab) => router.push(floorDetailHref(route.base, floor.id, tab))}
          />
        ) : null}

        {createError ? <Alert severity="error">{createError}</Alert> : null}

        {step ? (
          <>
            <Breadcrumbs
              items={[
                {
                  label: 'Floors List',
                  href: route.base,
                  onClick: (event) => {
                    event.preventDefault();
                    openStep('hub');
                  },
                },
                { label: 'Add Floor', active: true },
              ]}
              linkSx={{
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
              activeSx={{ color: 'primary.main', fontWeight: 600 }}
            />
            <Tabs
              fullWidth={false}
              scrollable={belowDesktop}
              tabs={wizardTabs}
              value={step}
              onChange={(value) => {
                if (
                  value === 'floor' ||
                  value === 'section' ||
                  value === 'table' ||
                  value === 'review'
                ) {
                  goToStep(value);
                }
              }}
            />
            {step === 'floor' ? (
              <FloorCreationStep
                key={ready ? 'floor-ready' : 'floor-loading'}
                details={details}
                nameError={displayNameError}
                loading={!ready}
                onCanSaveChange={setFloorCanSave}
                onChange={(next) => save({ ...draft, details: next })}
              />
            ) : null}
            {step === 'section' ? (
              <SectionStep
                sections={sections}
                tables={tables}
                loading={!ready}
                onCreate={(input) => saveSection(input)}
                onUpdate={(id, input) => saveSection(input, id)}
                onDelete={(id) =>
                  save({
                    ...draft,
                    sections: removeSection(sections, id),
                    tables: unlinkSectionTables(tables, id),
                  })
                }
              />
            ) : null}
            {step === 'table' ? (
              <TableStep
                tables={tables}
                sections={sections}
                loading={!ready}
                saving={bulkCreateTables.isPending}
                onGenerate={(input) => saveTables(input)}
                onDelete={(id) => save({ ...draft, tables: removeTable(tables, id) })}
                onToggleActive={(id) => save({ ...draft, tables: toggleTableActive(tables, id) })}
                onBulkEdit={(input) =>
                  save({ ...draft, tables: applyBulkTableEdit(tables, input) })
                }
              />
            ) : null}
            {step === 'review' ? (
              <ReviewStep
                details={withFloorCode(details)}
                sections={sections}
                tables={tables}
                loading={!ready}
                onEdit={goToStep}
              />
            ) : null}
          </>
        ) : null}

        {route.step === 'success' && !ready ? (
          <Loading message="Loading floor..." fullPage={false} />
        ) : null}
        {route.step === 'success' && ready && created ? (
          <SuccessStep
            floor={created}
            outlet={outlet}
            onHub={() => openStep('hub')}
            onSetup={() => openSaved(created)}
          />
        ) : null}

        {footer ? (footerTarget ? createPortal(footer, footerTarget) : footer) : null}
      </Box>
    </Box>
  );
}

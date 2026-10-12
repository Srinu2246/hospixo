'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { FloorCatalog } from '@/components/features/floor-and-table-setup/FloorCatalog';
import { FloorCreationStep } from '@/components/features/floor-and-table-setup/FloorCreationStep';
import { ReviewStep } from '@/components/features/floor-and-table-setup/ReviewStep';
import { SectionStep } from '@/components/features/floor-and-table-setup/SectionStep';
import { SuccessStep } from '@/components/features/floor-and-table-setup/SuccessStep';
import { TableStep } from '@/components/features/floor-and-table-setup/TableStep';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { FloorDetailScreen } from '@/features/management/floor-and-table-setup/FloorDetailScreen';
import type {
  FloorStatusFilter,
  SavedFloor,
  SectionInput,
  WizardStep,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  appendTables,
  buildSavedFloor,
  emptyFloor,
  floorDetailHref,
  insertSection,
  isWizardStep,
  parseFloorDetailRoute,
  removeSection,
  removeTable,
  replaceSection,
  toggleAllTables,
  toggleTableActive,
  unlinkSectionTables,
  withFloorCode,
} from '@/lib/helpers/floorAndTableSetup';
import { useFloorSetupDraft } from '@/lib/hooks/floor-and-table-setup/useFloorSetupDraft';
import {
  useArchiveFloor,
  useBulkCreateTables,
  useCreateFloor,
  useCreateSection,
  useFloors,
} from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useSidebarStore } from '@/stores/sidebarStore';

const wizardTabs = [
  { value: 'floor', label: 'Floor Creation' },
  { value: 'section', label: 'Section Creation' },
  { value: 'table', label: 'Table Creation' },
  { value: 'review', label: 'Review' },
];

export function FloorSetupScreen() {
  const branchName = useSidebarStore((state) => state.context.branchName);
  const branchId = useSidebarStore((state) => state.context.branchId);
  const outlet = branchName || (branchId ? `Branch ${branchId}` : 'this outlet');
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { route, draft, ready, save, openStep } = useFloorSetupDraft();
  const { details, sections, tables, floors } = draft;
  const detail = parseFloorDetailRoute(pathname);
  const [floorStatus, setFloorStatus] = useState<FloorStatusFilter>('all');
  const floorsQuery = useFloors(branchId, floorStatus);
  const createFloorRequest = useCreateFloor(branchId);
  const createSectionRequest = useCreateSection(branchId);
  const bulkCreateTables = useBulkCreateTables(branchId);
  const archiveFloorRequest = useArchiveFloor(branchId);

  const [nameError, setNameError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);

  const step: WizardStep | null = isWizardStep(route.step) ? route.step : null;
  const created = floors.find((floor) => floor.id === draft.createdId) ?? null;
  const floorTitle = details.name.trim() || 'Ground Floor';

  useEffect(() => {
    setFooterTarget(document.getElementById('app-shell-footer'));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (route.step === 'success' && !created) {
      openStep('hub');
      return;
    }
    if (step && step !== 'floor' && !details.name.trim()) {
      setNameError('Enter a floor name.');
      openStep('floor');
    }
  }, [created, details.name, openStep, ready, route.step, step]);

  function openCreate() {
    setNameError(null);
    openStep('floor', {
      ...draft,
      details: emptyFloor(),
      sections: [],
      tables: [],
      createdId: null,
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
    if (next !== 'floor' && !details.name.trim()) {
      setNameError('Enter a floor name.');
      openStep('floor');
      return;
    }
    setNameError(null);
    openStep(next, {
      ...draft,
      details: next === 'floor' ? details : withFloorCode(details),
    });
  }

  function saveSection(input: SectionInput, id?: string) {
    save({
      ...draft,
      sections: id ? replaceSection(sections, id, input) : insertSection(sections, input),
    });
  }

  async function createFloor() {
    if (!details.name.trim()) {
      setNameError('Enter a floor name.');
      openStep('floor');
      return;
    }
    if (branchId == null) {
      setCreateError('Select a branch before creating a floor.');
      return;
    }
    setCreateError(null);
    const saved = buildSavedFloor(details, sections, tables);
    try {
      const created = await createFloorRequest.mutateAsync({
        name: saved.details.name,
        description: saved.details.description,
        sort_order: 0,
        code: saved.details.code,
      });
      if (!saved.details.active) {
        await archiveFloorRequest.mutateAsync({
          floorId: created.id,
          body: { reason: 'Inactive', version: created.version ?? 0 },
        });
      }
      const sectionIds = new Map<string, number>();
      for (const [index, section] of saved.sections.entries()) {
        const createdSection = await createSectionRequest.mutateAsync({
          floorId: created.id,
          body: {
            name: section.name,
            description: section.description,
            sort_order: index,
            code: section.code,
          },
        });
        sectionIds.set(section.id, createdSection.id);
      }
      const tablesBySection = new Map<number, typeof saved.tables>();
      for (const table of saved.tables) {
        const sectionId =
          (table.sectionId ? sectionIds.get(table.sectionId) : undefined) ??
          sectionIds.values().next().value;
        if (sectionId == null) continue;
        tablesBySection.set(sectionId, [...(tablesBySection.get(sectionId) ?? []), table]);
      }
      for (const [sectionId, group] of tablesBySection) {
        await bulkCreateTables.mutateAsync({
          floorId: created.id,
          sectionId,
          body: {
            items: group.map((table, index) => ({
              name: table.number,
              description: '',
              capacity: table.seats,
              sort_order: index,
            })),
          },
        });
      }
      openStep('success', {
        ...draft,
        floors: [saved, ...floors.filter((floor) => floor.id !== draft.createdId)],
        details: saved.details,
        createdId: saved.id,
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create this floor.');
    }
  }

  const footer = step ? (
    <Stack
      component="footer"
      direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
      spacing={1.5}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: { [screen.mobile]: 2, [screen.desktop]: 3 },
        py: 2,
        alignItems: { [screen.tablet]: 'center' },
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        variant="outlined"
        sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        onClick={() => {
          if (step === 'floor') openStep('hub');
          else if (step === 'section') openStep('floor');
          else if (step === 'table') openStep('section');
          else openStep('table');
        }}
      >
        Back
      </ActionButton>
      {step === 'floor' ||
      (step === 'section' && sections.length > 0) ||
      (step === 'table' && tables.length > 0) ||
      step === 'review' ? (
        <ActionButton
          disabled={step === 'review' && createFloorRequest.isPending}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
          onClick={() => {
            if (step === 'floor') goToStep('section');
            else if (step === 'section') goToStep('table');
            else if (step === 'table') goToStep('review');
            else void createFloor();
          }}
        >
          {step === 'floor'
            ? 'Section Creation'
            : step === 'section'
              ? 'Update Floor'
              : step === 'table'
                ? 'Setup Permissions'
                : createFloorRequest.isPending
                  ? 'Creating Floor'
                  : 'Create Floor'}
        </ActionButton>
      ) : null}
    </Stack>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 2.5, pb: 3 }}>
      {route.step === 'hub' ? (
        <FloorCatalog
          floors={floorsQuery.data ?? []}
          isLoading={floorsQuery.isLoading}
          error={
            branchId == null
              ? 'Select a branch to load floors.'
              : floorsQuery.isError
                ? floorsQuery.error.message
                : null
          }
          status={floorStatus}
          onStatusChange={setFloorStatus}
          onCreate={openCreate}
          onOpen={(floor, tab) => router.push(floorDetailHref(route.base, floor.id, tab))}
        />
      ) : null}

      {createError ? <Alert severity="error">{createError}</Alert> : null}

      {step ? (
        <>
          <Tabs
            fullWidth={false}
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
            sx={{ flexWrap: 'wrap', width: '100%', rowGap: 0.5 }}
          />
          {step === 'floor' ? (
            <FloorCreationStep
              details={details}
              nameError={nameError}
              onChange={(next) => save({ ...draft, details: next })}
            />
          ) : null}
          {step === 'section' ? (
            <SectionStep
              floorName={floorTitle}
              sections={sections}
              tables={tables}
              onBackToFloor={() => openStep('floor')}
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
              onGenerate={(input) =>
                save({
                  ...draft,
                  tables: appendTables(
                    tables,
                    input,
                    sections.map((section) => section.id),
                  ),
                })
              }
              onDelete={(id) => save({ ...draft, tables: removeTable(tables, id) })}
              onToggleActive={(id) => save({ ...draft, tables: toggleTableActive(tables, id) })}
              onBulkEdit={() => save({ ...draft, tables: toggleAllTables(tables) })}
            />
          ) : null}
          {step === 'review' ? (
            <ReviewStep
              details={withFloorCode(details)}
              sections={sections}
              tables={tables}
              onEdit={goToStep}
            />
          ) : null}
        </>
      ) : null}

      {route.step === 'success' && created ? (
        <SuccessStep
          floor={created}
          outlet={outlet}
          onHub={() => openStep('hub')}
          onSetup={() => openSaved(created)}
        />
      ) : null}

      {footer ? (footerTarget ? createPortal(footer, footerTarget) : footer) : null}
    </Box>
  );
}

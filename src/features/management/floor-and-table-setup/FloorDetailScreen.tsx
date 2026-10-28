'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { FloorTablesPanelActions } from '@/components/features/floor-and-table-setup/FloorTablesPanel';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { StickyActionFooter } from '@/components/shared/ui/StickyActionFooter';
import { FloorSectionsPanel } from '@/components/features/floor-and-table-setup/FloorSectionsPanel';
import { FloorTablesPanel } from '@/components/features/floor-and-table-setup/FloorTablesPanel';
import { SetupCard } from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/ui/Breadcrumbs';
import { Loading } from '@/components/shared/ui/Loading';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  CatalogFloor,
  CatalogSection,
  CatalogTable,
  FloorDetailTab,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { floorDetailHref, type FloorDetailRoute } from '@/lib/helpers/floorAndTableSetup';
import {
  useArchiveFloor,
  useArchiveSection,
  useCreateSection,
  useFloor,
  useFloorMap,
  useFloorSections,
  useRestoreFloor,
  useSectionTables,
  useRestoreSection,
  useUpdateFloor,
  useUpdateSection,
} from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { useSidebarStore } from '@/stores/sidebarStore';
import { formatCreatedOn, isActiveRecord } from '@/lib/schemas/floor-and-table-setup/floors';
import {
  canSubmitSetupForm,
  floorFormSchema,
  type FloorFormValues,
} from '@/lib/schemas/floor-and-table-setup/floorSetupFormSchema';
import { screen } from '@/lib/theme/mui/breakpoints';

const FLOOR_DETAIL_FORM_ID = 'floor-detail-form';

function floorDetailCrumbs({
  base,
  floorId,
  floorName,
  section,
  isNewSection,
  editing,
  onFloors,
  onFloor,
  onSection,
}: Readonly<{
  base: string;
  floorId: string;
  floorName: string;
  section: { id: string; name: string } | null;
  isNewSection: boolean;
  editing: boolean;
  onFloors: () => void;
  onFloor: () => void;
  onSection: (sectionId: string) => void;
}>): BreadcrumbItem[] {
  const floors: BreadcrumbItem = {
    label: 'Floors List',
    href: base,
    onClick: (event) => {
      event.preventDefault();
      onFloors();
    },
  };
  const inSection = Boolean(section) || isNewSection;
  const floor: BreadcrumbItem = inSection
    ? {
        label: floorName,
        href: floorDetailHref(base, floorId, 'sections'),
        onClick: (event) => {
          event.preventDefault();
          onFloor();
        },
      }
    : { label: floorName, active: true };

  if (isNewSection) return [floors, floor, { label: 'Add Section', active: true }];
  if (editing && section) {
    return [
      floors,
      floor,
      {
        label: section.name,
        href: floorDetailHref(base, floorId, 'sections', section.id),
        onClick: (event) => {
          event.preventDefault();
          onSection(section.id);
        },
      },
      { label: 'Edit Section', active: true },
    ];
  }
  if (section) return [floors, floor, { label: section.name, active: true }];
  return [floors, floor];
}

/** Sticky footer primary labels (mobile/tablet) — one action per detail tab. */
const detailFooterPrimaryLabel = {
  floor: 'Update Floor',
  sections: 'Update Section',
  tables: 'Update Table',
} as const;

const detailTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'floor', label: 'Floor' },
  { value: 'sections', label: 'Sections' },
  { value: 'tables', label: 'Tables' },
];

export function FloorDetailScreen({
  floorId,
  branchId,
  branchName,
  detail,
  base,
}: Readonly<{
  floorId: string;
  branchId: number | undefined;
  branchName: string;
  detail: FloorDetailRoute;
  base: string;
}>) {
  const router = useRouter();
  const sessionHydrated = useSidebarStore((state) => state.sessionHydrated);
  const numericFloorId = /^\d+$/.test(floorId) ? Number(floorId) : undefined;
  const floorQuery = useFloor(branchId, numericFloorId);
  const sectionsQuery = useFloorSections(branchId, numericFloorId);
  const updateFloor = useUpdateFloor(branchId, numericFloorId);
  const archiveFloor = useArchiveFloor(branchId);
  const restoreFloor = useRestoreFloor(branchId);
  const createSection = useCreateSection(branchId);
  const updateSection = useUpdateSection(branchId);
  const archiveSection = useArchiveSection(branchId);
  const restoreSection = useRestoreSection(branchId);
  const sections = sectionsQuery.data ?? [];
  const tablesQuery = useSectionTables(branchId, numericFloorId, sections);
  const mapSectionId = numericSectionId(sections[0]?.id);
  const floorMapQuery = useFloorMap(branchId, numericFloorId, mapSectionId);
  const sectionsLoading = sectionsQuery.isPending;
  const tablesLoading =
    sectionsLoading ||
    (sections.length > 0 && tablesQuery.isPending) ||
    (mapSectionId != null && floorMapQuery.isPending);
  const tables = mergeTables(tablesQuery.data ?? [], floorMapQuery.data ?? []);
  const sectionsWithTables = sections.map((section) => {
    const owned = tables.filter((table) => table.sectionId === section.id);
    const activeCount = owned.filter((table) => table.active).length;
    return {
      ...section,
      tableCount: owned.length,
      seatCount: owned.reduce((total, table) => total + table.seats, 0),
      activeTableCount: activeCount,
      inactiveTableCount: owned.length - activeCount,
    };
  });
  const footerTarget = useAppShellFooterTarget();
  const theme = useTheme();
  const belowDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const tablesPanelActionsRef = useRef<FloorTablesPanelActions | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [floorCanSave, setFloorCanSave] = useState(false);
  const record = floorQuery.data;
  const view: CatalogFloor | null = record
    ? {
        id: String(record.id),
        name: record.name,
        code: record.code ?? '',
        description: record.description ?? '',
        active: isActiveRecord(record),
        branch: branchName,
        createdBy: '—',
        createdOn: formatCreatedOn(record.created_at),
        updatedLabel: '',
        updatedAt: Date.parse(record.updated_at ?? '') || 0,
        tableCount: tables.length,
        seatCount: tables.reduce((total, table) => total + table.seats, 0),
        hubTableCount: tables.length,
        hubSeatCount: tables.reduce((total, table) => total + table.seats, 0),
        activeTableCount: tables.filter((table) => table.active).length,
        maintenanceCount: tables.filter((table) => !table.active).length,
        sections: sectionsWithTables,
        tables,
      }
    : null;
  const isNewSection = detail.sectionId === 'new';
  const section = sectionsWithTables.find((item) => item.id === detail.sectionId) ?? null;

  function openTab(tab: FloorDetailTab) {
    router.push(floorDetailHref(base, floorId, tab));
  }

  function openSection(sectionId: string, editing = false) {
    router.push(floorDetailHref(base, floorId, 'sections', sectionId, editing));
  }

  async function saveFloor(values: {
    name: string;
    code: string;
    description: string;
    active: boolean;
  }) {
    if (!record || numericFloorId == null) return;
    setActionError(null);
    try {
      let version = record.version ?? 0;
      const wasActive = isActiveRecord(record);
      if (values.active !== wasActive) {
        const changed = values.active
          ? await restoreFloor.mutateAsync({
              floorId: numericFloorId,
              body: { reason: 'Restored', version },
            })
          : await archiveFloor.mutateAsync({
              floorId: numericFloorId,
              body: { reason: 'Inactive', version },
            });
        version = changed.version ?? version;
      }
      await updateFloor.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim(),
        sort_order: record.sort_order ?? 0,
        status: values.active ? 'active' : 'inactive',
        version,
        code: values.code.trim(),
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update this floor.');
    }
  }

  async function saveSection(next: CatalogSection) {
    if (numericFloorId == null) return;
    setActionError(null);
    const body = {
      name: next.name.trim(),
      description: next.description.trim(),
      sort_order: next.sortOrder ?? 0,
      code: next.code.trim(),
    };
    try {
      const numericId = /^\d+$/.test(next.id) ? Number(next.id) : undefined;
      if (numericId == null) {
        const created = await createSection.mutateAsync({ floorId: numericFloorId, body });
        openSection(String(created.id));
        return;
      }
      let version = next.version ?? 0;
      const wasActive = sections.find((item) => item.id === next.id)?.active ?? true;
      if (next.active !== wasActive) {
        const changed = next.active
          ? await restoreSection.mutateAsync({
              floorId: numericFloorId,
              sectionId: numericId,
              body: { reason: 'Restored', version },
            })
          : await archiveSection.mutateAsync({
              floorId: numericFloorId,
              sectionId: numericId,
              body: { reason: 'Inactive', version },
            });
        version = changed.version ?? version;
      }
      await updateSection.mutateAsync({
        floorId: numericFloorId,
        sectionId: numericId,
        body: { ...body, status: next.active ? 'active' : 'inactive', version },
      });
      openSection(String(numericId));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save this section.');
    }
  }

  const footer =
    detail.tab === 'floor' ? (
      <StickyActionFooter
        onBack={() => router.push(base)}
        primaryLabel={detailFooterPrimaryLabel.floor}
        primaryType="submit"
        primaryForm={FLOOR_DETAIL_FORM_ID}
        primaryDisabled={
          !floorCanSave || updateFloor.isPending || archiveFloor.isPending || restoreFloor.isPending
        }
        primaryLoading={updateFloor.isPending}
      />
    ) : detail.tab === 'sections' && !detail.editing && !section ? (
      <StickyActionFooter
        onBack={() => router.push(base)}
        primaryLabel={detailFooterPrimaryLabel.sections}
        onPrimary={() => openSection('new', true)}
      />
    ) : detail.tab === 'sections' && section && !detail.editing ? (
      <StickyActionFooter onBack={() => openTab('sections')} showPrimary={false} />
    ) : detail.tab === 'tables' ? (
      <StickyActionFooter
        onBack={() => router.push(base)}
        primaryLabel={detailFooterPrimaryLabel.tables}
        onPrimary={() => tablesPanelActionsRef.current?.openAddTable()}
      />
    ) : null;

  if (!sessionHydrated || (branchId != null && numericFloorId != null && floorQuery.isPending)) {
    return <Loading message="Loading floor..." fullPage={false} />;
  }
  if (branchId == null || numericFloorId == null) {
    return <Alert severity="error">This floor could not be loaded.</Alert>;
  }
  if (floorQuery.isError || !view) {
    return (
      <Alert severity="error">{floorQuery.error?.message ?? 'Could not load this floor.'}</Alert>
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
      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ pb: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box
          sx={{
            position: { xs: 'sticky', md: 'static' },
            top: { xs: 0, md: 'auto' },
            zIndex: { xs: 11, md: 'auto' },
            bgcolor: { xs: 'background.default', md: 'transparent' },
            pt: { xs: 2, md: 0 },
            pb: { xs: 2.5, md: 0 },
          }}
        >
          <Stack spacing={1.5}>
            <Breadcrumbs
              items={floorDetailCrumbs({
                base,
                floorId,
                floorName: view.name,
                section,
                isNewSection,
                editing: detail.editing,
                onFloors: () => router.push(base),
                onFloor: () => openTab(section || isNewSection ? 'sections' : 'overview'),
                onSection: (sectionId) => openSection(sectionId),
              })}
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
              showIndicator={!belowDesktop}
              tabs={detailTabs}
              value={detail.tab}
              onChange={(value) => {
                if (
                  value === 'overview' ||
                  value === 'floor' ||
                  value === 'sections' ||
                  value === 'tables'
                ) {
                  openTab(value);
                }
              }}
            />
          </Stack>
        </Box>

        {actionError ? <Alert severity="error">{actionError}</Alert> : null}
        {detail.tab === 'overview' && sectionsLoading ? (
          <Loading message="Loading floor..." fullPage={false} />
        ) : null}
        {detail.tab === 'overview' && !sectionsLoading ? (
          <OverviewPanel
            floor={view}
            sections={sectionsWithTables}
            onOpenSection={(sectionId) => openSection(sectionId)}
          />
        ) : null}
        {detail.tab === 'floor' ? (
          <FloorPanel
            key={`${view.id}-${record?.version ?? 0}`}
            floor={view}
            saving={updateFloor.isPending || archiveFloor.isPending || restoreFloor.isPending}
            onCanSaveChange={setFloorCanSave}
            onSave={(values) => {
              void saveFloor(values);
            }}
          />
        ) : null}
        {detail.tab === 'sections' && sectionsLoading ? (
          <Loading message="Loading sections..." fullPage={false} />
        ) : null}
        {detail.tab === 'sections' && !sectionsLoading && sectionsQuery.isError ? (
          <Alert severity="error">{sectionsQuery.error.message}</Alert>
        ) : null}
        {detail.tab === 'sections' && !sectionsLoading && !sectionsQuery.isError ? (
          <FloorSectionsPanel
            sections={sectionsWithTables}
            tables={tables}
            selected={isNewSection ? null : section}
            editing={detail.editing || isNewSection}
            branchId={branchId}
            floorId={numericFloorId}
            branchName={branchName}
            onOpen={(sectionId) => openSection(sectionId)}
            onEdit={(sectionId) => openSection(sectionId, true)}
            onAdd={() => openSection('new', true)}
            onSave={(next) => {
              void saveSection(next);
            }}
            onCancel={() => (section ? openSection(section.id) : openTab('sections'))}
          />
        ) : null}
        {detail.tab === 'tables' && tablesLoading ? (
          <Loading message="Loading tables..." fullPage={false} />
        ) : null}
        {detail.tab === 'tables' && !tablesLoading && tablesQuery.isError && tables.length === 0 ? (
          <Alert severity="error">{tablesQuery.error.message}</Alert>
        ) : null}
        {detail.tab === 'tables' &&
        !tablesLoading &&
        !(tablesQuery.isError && tables.length === 0) ? (
          <FloorTablesPanel
            tables={tables}
            sections={sectionsWithTables}
            branchId={branchId}
            floorId={numericFloorId}
            onRegisterActions={(actions) => {
              tablesPanelActionsRef.current = actions;
            }}
          />
        ) : null}
        {footer ? (
          footerTarget ? (
            createPortal(
              <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>{footer}</Box>,
              footerTarget,
            )
          ) : (
            <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>{footer}</Box>
          )
        ) : null}
      </Stack>
    </Box>
  );
}

function numericSectionId(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function mergeTables(
  listed: readonly CatalogTable[],
  mapped: readonly CatalogTable[],
): CatalogTable[] {
  const byId = new Map<string, CatalogTable>();
  for (const table of mapped) byId.set(table.id, table);
  for (const table of listed) {
    const previous = byId.get(table.id);
    byId.set(table.id, previous ? { ...previous, ...table } : table);
  }
  return [...byId.values()];
}

function OverviewPanel({
  floor,
  sections,
  onOpenSection,
}: Readonly<{
  floor: CatalogFloor;
  sections: readonly CatalogSection[];
  onOpenSection: (sectionId: string) => void;
}>) {
  return (
    <Stack spacing={2}>
      <SetupCard>
        <Typography sx={{ fontWeight: 800, mb: 2 }}>Floor Information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr 1fr' },
            gap: 2.5,
          }}
        >
          <Info label="Floor Name" value={floor.name} />
          <Info label="Branch" value={floor.branch} />
          <Info label="Status">
            <StatusChip
              label={floor.active ? 'Active' : 'Inactive'}
              variantType={floor.active ? 'success' : 'default'}
            />
          </Info>
          <Info label="Floor Code" value={floor.code || '—'} />
          <Info label="Tables" value={`${floor.tableCount} Tables`} />
          <Info label="Created By" value={floor.createdBy} />
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Info label="Created On" value={floor.createdOn} />
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Info label="Floor Description" value={floor.description} />
        </Box>
      </SetupCard>

      {sections.length > 0 ? (
        <SetupCard>
          <Typography sx={{ fontWeight: 800, mb: 2 }}>Sections Overview</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {sections.map((item) => (
              <Box
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.name} section overview`}
                onClick={() => onOpenSection(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenSection(item.id);
                  }
                }}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                  '&:hover': { borderColor: 'grey.400' },
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>
                  <StatusChip
                    label={item.active ? 'Active' : 'Inactive'}
                    variantType={item.active ? 'success' : 'default'}
                  />
                </Stack>
                <Stack direction="row" spacing={4}>
                  <Info label="Tables" value={String(item.tableCount)} strong />
                  <Info label="Seats" value={String(item.seatCount)} strong />
                </Stack>
              </Box>
            ))}
          </Box>
        </SetupCard>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr 1fr', [screen.desktop]: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <Stat label="Total Tables" value={floor.tableCount} />
        <Stat label="Total Seats" value={floor.seatCount} />
        <Stat label="Active Tables" value={floor.activeTableCount} />
        <Stat label="Inactive" value={floor.maintenanceCount} />
      </Box>
    </Stack>
  );
}

function FloorPanel({
  floor,
  saving,
  onCanSaveChange,
  onSave,
}: Readonly<{
  floor: CatalogFloor;
  saving: boolean;
  onCanSaveChange: (canSave: boolean) => void;
  onSave: (values: FloorFormValues) => void;
}>) {
  const theme = useTheme();
  const belowDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, trigger, formState } = useForm<FloorFormValues>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: {
      name: floor.name,
      code: floor.code,
      description: floor.description,
      active: floor.active,
    },
    mode: 'onChange',
  });
  const canSave = canSubmitSetupForm('edit', formState) && !saving;

  useEffect(() => {
    void trigger();
  }, [trigger]);

  useEffect(() => {
    onCanSaveChange(canSave);
    return () => onCanSaveChange(false);
  }, [canSave, onCanSaveChange]);

  return (
    <Box
      component="form"
      id={FLOOR_DETAIL_FORM_ID}
      onSubmit={handleSubmit((values) => {
        if (!canSave) return;
        onSave(values);
      })}
    >
      <SetupCard>
        <Typography sx={{ fontWeight: 800, mb: 2, display: { xs: 'none', md: 'block' } }}>
          General Settings
        </Typography>
        <Typography sx={{ fontWeight: 800, mb: 2, display: { xs: 'block', md: 'none' } }}>
          Floor Details
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                id="detail-floor-name"
                label="Floor Name"
                required
                value={field.value}
                error={fieldState.isTouched && Boolean(fieldState.error)}
                helperText={fieldState.isTouched ? fieldState.error?.message : undefined}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                id="detail-floor-code"
                label="Floor Code"
                helperText={belowDesktop ? 'Assigned code for orders routing' : undefined}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                id="detail-floor-description"
                label="Description"
                placeholder={belowDesktop ? 'Enter floor description' : undefined}
                value={field.value}
                multiline
                rows={3}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <LabeledSwitch
                    title="Floor Status"
                    hint="Toggle active visibility on checkout POS channels"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <LabeledSwitch
                    title="Floor Status"
                    hint="Inactive floors are archived. Turning a floor back on restores it."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </Box>
              </>
            )}
          />
        </Box>
        <Box sx={{ mt: 2, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <ActionButton type="submit" disabled={!canSave}>
            Save Changes
          </ActionButton>
        </Box>
      </SetupCard>
    </Box>
  );
}

function Info({
  label,
  value,
  children,
  strong = false,
}: Readonly<{ label: string; value?: string; children?: ReactNode; strong?: boolean }>) {
  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
        {label}
      </Typography>
      {children ?? (
        <Typography
          sx={{ fontWeight: strong ? 800 : 700, fontSize: strong ? '1.25rem' : '0.95rem' }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}

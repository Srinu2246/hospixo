'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ChevronLeft } from 'lucide-react';

import { FloorSectionsPanel } from '@/components/features/floor-and-table-setup/FloorSectionsPanel';
import { FloorTablesPanel } from '@/components/features/floor-and-table-setup/FloorTablesPanel';
import {
  LabeledDropdown,
  SetupCard,
  StatusRow,
} from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { Loading } from '@/components/shared/ui/Loading';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  CatalogFloor,
  CatalogSection,
  CatalogTable,
  FloorActivity,
  FloorDetailTab,
  FloorType,
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
import { MOCK_FLOOR_ACTIVITY } from '@/lib/mocks/floor-and-table-setup/floorSetup.mocks';
import { formatCreatedOn, isActiveRecord } from '@/lib/schemas/floor-and-table-setup/floors';
import { screen } from '@/lib/theme/mui/breakpoints';

const detailTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'floor', label: 'Floor' },
  { value: 'sections', label: 'Sections' },
  { value: 'tables', label: 'Tables' },
  { value: 'history', label: 'History' },
];

const floorTypes: { id: FloorType; label: string }[] = [
  { id: 'indoor', label: 'Indoor' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'vip', label: 'VIP' },
  { id: 'banquet', label: 'Banquet' },
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
  const [actionError, setActionError] = useState<string | null>(null);
  const record = floorQuery.data;
  const view: CatalogFloor | null = record
    ? {
        id: String(record.id),
        name: record.name,
        code: record.code ?? '',
        type: 'indoor',
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
        activity: MOCK_FLOOR_ACTIVITY,
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

  const title =
    detail.editing && section
      ? `Edit Section – ${section.name}`
      : isNewSection
        ? 'Add Section'
        : section
          ? `${section.name} Section`
          : (view?.name ?? 'Floor');

  const footer =
    detail.tab === 'sections' && !detail.editing && !section ? (
      <DetailFooter>
        <ActionButton
          variant="outlined"
          onClick={() => router.push(base)}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Back
        </ActionButton>
        <ActionButton
          onClick={() => openTab('floor')}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Update Floor
        </ActionButton>
      </DetailFooter>
    ) : detail.tab === 'sections' && section && !detail.editing ? (
      <DetailFooter>
        <ActionButton
          variant="outlined"
          onClick={() => openTab('sections')}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Back
        </ActionButton>
      </DetailFooter>
    ) : detail.tab === 'tables' ? (
      <DetailFooter>
        <ActionButton
          variant="outlined"
          onClick={() => router.push(base)}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Back
        </ActionButton>
      </DetailFooter>
    ) : null;

  if (branchId == null || numericFloorId == null) {
    return <Alert severity="error">This floor could not be loaded.</Alert>;
  }
  if (floorQuery.isLoading) {
    return <Loading message="Loading floor..." fullPage={false} />;
  }
  if (floorQuery.isError || !view) {
    return (
      <Alert severity="error">{floorQuery.error?.message ?? 'Could not load this floor.'}</Alert>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ pb: 3 }}>
      <Tabs
        fullWidth={false}
        tabs={detailTabs}
        value={detail.tab}
        onChange={(value) => {
          if (
            value === 'overview' ||
            value === 'floor' ||
            value === 'sections' ||
            value === 'tables' ||
            value === 'history'
          ) {
            openTab(value);
          }
        }}
        sx={{ flexWrap: 'wrap', width: '100%', rowGap: 0.5 }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <ActionButton
            variant="icon"
            ariaLabel="Back"
            onClick={() => {
              if (detail.editing && section) openSection(section.id);
              else if (section) openTab('sections');
              else router.push(base);
            }}
          >
            <ChevronLeft size={18} />
          </ActionButton>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { [screen.mobile]: '1.15rem', [screen.desktop]: '1.35rem' },
            }}
          >
            {title}
          </Typography>
        </Stack>
        {section && !detail.editing ? (
          <ActionButton onClick={() => openSection(section.id, true)} sx={{ flexShrink: 0 }}>
            Edit Section
          </ActionButton>
        ) : null}
      </Stack>

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}
      {detail.tab === 'overview' ? (
        <OverviewPanel
          floor={view}
          sections={sectionsWithTables}
          onOpenSection={(sectionId) => openSection(sectionId)}
          onViewHistory={() => openTab('history')}
        />
      ) : null}
      {detail.tab === 'floor' ? (
        <FloorPanel
          key={`${view.id}-${record?.version ?? 0}`}
          floor={view}
          saving={updateFloor.isPending || archiveFloor.isPending || restoreFloor.isPending}
          onSave={(values) => {
            void saveFloor(values);
          }}
        />
      ) : null}
      {detail.tab === 'sections' && sectionsQuery.isLoading ? (
        <Loading message="Loading sections..." fullPage={false} />
      ) : null}
      {detail.tab === 'sections' && sectionsQuery.isError ? (
        <Alert severity="error">{sectionsQuery.error.message}</Alert>
      ) : null}
      {detail.tab === 'sections' && !sectionsQuery.isLoading && !sectionsQuery.isError ? (
        <FloorSectionsPanel
          sections={sectionsWithTables}
          tables={tables}
          selected={isNewSection ? null : section}
          editing={detail.editing || isNewSection}
          branchId={branchId}
          floorId={numericFloorId}
          onOpen={(sectionId) => openSection(sectionId)}
          onEdit={(sectionId) => openSection(sectionId, true)}
          onAdd={() => openSection('new', true)}
          onSave={(next) => {
            void saveSection(next);
          }}
          onCancel={() => (section ? openSection(section.id) : openTab('sections'))}
        />
      ) : null}
      {detail.tab === 'tables' && (tablesQuery.isLoading || floorMapQuery.isLoading) ? (
        <Loading message="Loading tables..." fullPage={false} />
      ) : null}
      {detail.tab === 'tables' && tablesQuery.isError && tables.length === 0 ? (
        <Alert severity="error">{tablesQuery.error.message}</Alert>
      ) : null}
      {detail.tab === 'tables' &&
      !tablesQuery.isLoading &&
      !floorMapQuery.isLoading &&
      !(tablesQuery.isError && tables.length === 0) ? (
        <FloorTablesPanel
          tables={tables}
          sections={sectionsWithTables}
          branchId={branchId}
          floorId={numericFloorId}
        />
      ) : null}
      {detail.tab === 'history' ? <HistoryPanel activity={view.activity} /> : null}

      {footer ? (footerTarget ? createPortal(footer, footerTarget) : footer) : null}
    </Stack>
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

function DetailFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
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
      {children}
    </Stack>
  );
}

function OverviewPanel({
  floor,
  sections,
  onOpenSection,
  onViewHistory,
}: Readonly<{
  floor: CatalogFloor;
  sections: readonly CatalogSection[];
  onOpenSection: (sectionId: string) => void;
  onViewHistory: () => void;
}>) {
  const recentActivity = floor.activity.slice(0, 4);

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
              gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {sections.slice(0, 2).map((item) => (
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

      <SetupCard>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 800 }}>History</Typography>
          <ActionButton variant="text" size="small" onClick={onViewHistory}>
            View All
          </ActionButton>
        </Stack>
        {recentActivity.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            No history for this floor yet.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {recentActivity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </Stack>
        )}
      </SetupCard>
    </Stack>
  );
}

function HistoryPanel({ activity }: Readonly<{ activity: readonly FloorActivity[] }>) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={{ fontWeight: 800 }}>History</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Recent changes and activity for this floor
        </Typography>
      </Box>
      <SetupCard>
        {activity.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            No history for this floor yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </Stack>
        )}
      </SetupCard>
    </Stack>
  );
}

function ActivityRow({ item }: Readonly<{ item: FloorActivity }>) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.message}</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', flexShrink: 0 }}>
        {item.timeLabel}
      </Typography>
    </Stack>
  );
}

function FloorPanel({
  floor,
  saving,
  onSave,
}: Readonly<{
  floor: CatalogFloor;
  saving: boolean;
  onSave: (values: { name: string; code: string; description: string; active: boolean }) => void;
}>) {
  const [name, setName] = useState(floor.name);
  const [code, setCode] = useState(floor.code);
  const [type, setType] = useState<FloorType>(floor.type);
  const [description, setDescription] = useState(floor.description);
  const [active, setActive] = useState(floor.active);

  return (
    <SetupCard>
      <Typography sx={{ fontWeight: 800, mb: 2 }}>General Settings</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Input
          id="detail-floor-name"
          label="Floor Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="detail-floor-code"
          label="Floor Code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <LabeledDropdown label="Floor Type" options={floorTypes} value={type} onChange={setType} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Input
          id="detail-floor-description"
          label="Description"
          value={description}
          multiline
          rows={3}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Box>
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <StatusRow
          title="Floor Status"
          hint="Inactive floors are archived. Turning a floor back on restores it."
          checked={active}
          onChange={setActive}
        />
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <ActionButton
          disabled={saving || !name.trim()}
          onClick={() => onSave({ name, code, description, active })}
        >
          Save Changes
        </ActionButton>
      </Box>
    </SetupCard>
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

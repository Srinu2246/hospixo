'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
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
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  CatalogFloor,
  CatalogSection,
  CatalogTable,
  FloorDetailTab,
  FloorType,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { floorDetailHref, type FloorDetailRoute } from '@/lib/helpers/floorAndTableSetup';
import {
  readCatalogSession,
  subscribeCatalogSession,
  writeCatalogSession,
} from '@/lib/mocks/floor-and-table-setup/floorSetup.mocks';
import { screen } from '@/lib/theme/mui/breakpoints';

const detailTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'floor', label: 'Floor' },
  { value: 'sections', label: 'Sections' },
  { value: 'tables', label: 'Tables' },
];

const floorTypes: { id: FloorType; label: string }[] = [
  { id: 'indoor', label: 'Indoor' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'vip', label: 'VIP' },
  { id: 'banquet', label: 'Banquet' },
];

export function FloorDetailScreen({
  floor,
  detail,
  base,
}: Readonly<{ floor: CatalogFloor; detail: FloorDetailRoute; base: string }>) {
  const router = useRouter();
  const view = useSyncExternalStore(
    subscribeCatalogSession,
    () => readCatalogSession(floor.id) ?? floor,
    () => floor,
  );
  const { sections, tables } = view;
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);
  const isNewSection = detail.sectionId === 'new';
  const section = sections.find((item) => item.id === detail.sectionId) ?? null;

  useEffect(() => {
    setFooterTarget(document.getElementById('app-shell-footer'));
  }, []);

  function openTab(tab: FloorDetailTab) {
    router.push(floorDetailHref(base, floor.id, tab));
  }

  function openSection(sectionId: string, editing = false) {
    router.push(floorDetailHref(base, floor.id, 'sections', sectionId, editing));
  }

  const title =
    detail.editing && section
      ? `Edit Section – ${section.name}`
      : isNewSection
        ? 'Add Section'
        : section
          ? `${section.name} Section`
          : view.name;

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
            value === 'tables'
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

      {detail.tab === 'overview' ? <OverviewPanel floor={view} sections={sections} /> : null}
      {detail.tab === 'floor' ? <FloorPanel floor={view} /> : null}
      {detail.tab === 'sections' ? (
        <FloorSectionsPanel
          sections={sections}
          tables={tables}
          selected={section}
          editing={detail.editing}
          onOpen={(sectionId) => openSection(sectionId)}
          onEdit={(sectionId) => openSection(sectionId, true)}
          onDelete={(sectionId) =>
            writeCatalogSession(floor.id, {
              sections: sections.filter((item) => item.id !== sectionId),
            })
          }
          onAdd={() => openSection('new', true)}
          onSave={(next) => {
            writeCatalogSession(floor.id, {
              sections: sections.some((item) => item.id === next.id)
                ? sections.map((item) => (item.id === next.id ? next : item))
                : [...sections, next],
            });
            openSection(next.id);
          }}
          onCancel={() => (section ? openSection(section.id) : openTab('sections'))}
        />
      ) : null}
      {detail.tab === 'tables' ? (
        <FloorTablesPanel
          tables={tables}
          sections={sections}
          onChange={(next) => writeCatalogSession(floor.id, { tables: next })}
        />
      ) : null}

      {footer ? (footerTarget ? createPortal(footer, footerTarget) : footer) : null}
    </Stack>
  );
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
}: Readonly<{ floor: CatalogFloor; sections: readonly CatalogSection[] }>) {
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
          <Info
            label="Floor Type"
            value={
              floor.type === 'indoor'
                ? 'Indoor'
                : floor.type === 'outdoor'
                  ? 'Outdoor'
                  : floor.type === 'vip'
                    ? 'VIP'
                    : 'Banquet'
            }
          />
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
              sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
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
        <Stat label="Maintenance" value={floor.maintenanceCount} />
      </Box>

      <SetupCard>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 800 }}>Recent Activity</Typography>
          <ActionButton variant="text" size="small">
            View All
          </ActionButton>
        </Stack>
        <Stack spacing={1.25}>
          {floor.activity.map((item) => (
            <Stack key={item.id} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.message}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', flexShrink: 0 }}>
                {item.timeLabel}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </SetupCard>
    </Stack>
  );
}

function FloorPanel({ floor }: Readonly<{ floor: CatalogFloor }>) {
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
          hint="Toggle active visibility on checkout POS channels"
          checked={active}
          onChange={setActive}
        />
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

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye, LayoutGrid, Pencil, Plus, QrCode } from 'lucide-react';

import {
  EditTableDialog,
  nextTableNames,
  numericId,
} from '@/components/features/floor-and-table-setup/EditTableDialog';
import { SetupCard, StatusRow } from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  CatalogSection,
  CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { useCreateTable } from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { screen } from '@/lib/theme/mui/breakpoints';

export function FloorSectionsPanel({
  sections,
  tables,
  selected,
  editing,
  branchId,
  floorId,
  onOpen,
  onEdit,
  onAdd,
  onSave,
  onCancel,
}: Readonly<{
  sections: readonly CatalogSection[];
  tables: readonly CatalogTable[];
  selected: CatalogSection | null;
  editing: boolean;
  branchId?: number;
  floorId?: number;
  onOpen: (sectionId: string) => void;
  onEdit: (sectionId: string) => void;
  onAdd: () => void;
  onSave: (section: CatalogSection) => void;
  onCancel: () => void;
}>) {
  if (editing) {
    return <SectionEditor section={selected} onSave={onSave} onCancel={onCancel} />;
  }
  if (selected) {
    return (
      <SectionDetail
        section={selected}
        tables={tables.filter((item) => item.sectionId === selected.id)}
        floorTables={tables}
        branchId={branchId}
        floorId={floorId}
      />
    );
  }
  return <SectionList sections={sections} onOpen={onOpen} onEdit={onEdit} onAdd={onAdd} />;
}

function SectionList({
  sections,
  onOpen,
  onEdit,
  onAdd,
}: Readonly<{
  sections: readonly CatalogSection[];
  onOpen: (sectionId: string) => void;
  onEdit: (sectionId: string) => void;
  onAdd: () => void;
}>) {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ [screen.mobile]: 'column', [screen.desktop]: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { [screen.desktop]: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }}>Sections List</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Manage and organize dining zones within this floor
          </Typography>
        </Box>
        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={onAdd}
          sx={{ width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' } }}
        >
          Add Section
        </ActionButton>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            [screen.mobile]: '1fr',
            [screen.tablet]: '1fr 1fr',
            [screen.wide]: '1fr 1fr 1fr',
          },
          gap: 1.5,
        }}
      >
        {sections.map((section) => (
          <Box
            key={section.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${section.name} section overview`}
            onClick={() => onOpen(section.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(section.id);
              }
            }}
            sx={{
              p: 1.75,
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: 'grey.400' },
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>{section.name}</Typography>
              <StatusChip
                label={section.active ? 'Active' : 'Inactive'}
                variantType={section.active ? 'success' : 'default'}
              />
            </Stack>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 1 }}>
              {section.tableCount} Tables · {section.seatCount} Seats
            </Typography>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <ActionButton variant="outlined" size="small" startIcon={<QrCode size={14} />}>
                Download QR
              </ActionButton>
              <Stack direction="row" spacing={0.5}>
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`View ${section.name}`}
                  onClick={() => onOpen(section.id)}
                >
                  <Eye size={15} />
                </ActionButton>
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`Edit ${section.name}`}
                  onClick={() => onEdit(section.id)}
                >
                  <Pencil size={15} />
                </ActionButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

function SectionDetail({
  section,
  tables,
  floorTables,
  branchId,
  floorId,
}: Readonly<{
  section: CatalogSection;
  tables: readonly CatalogTable[];
  floorTables: readonly CatalogTable[];
  branchId?: number;
  floorId?: number;
}>) {
  const [draft, setDraft] = useState<CatalogTable | null>(null);
  const createTable = useCreateTable(branchId);
  const sectionId = numericId(section.id);
  const canCreate = floorId != null && sectionId != null;

  async function saveTable(next: CatalogTable) {
    if (floorId == null || sectionId == null) return;
    try {
      await createTable.mutateAsync({
        floorId,
        sectionId,
        body: {
          name: next.number.trim(),
          description: next.description ?? '',
          capacity: next.seats,
          sort_order: next.sortOrder ?? floorTables.length,
        },
      });
      setDraft(null);
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  }

  return (
    <Stack spacing={2}>
      <SetupCard>
        <Typography sx={{ fontWeight: 800, mb: 2 }}>Section Information</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Field label="Section Name" value={section.name} />
          <Field label="Section Code" value={section.code} />
          <Box>
            <Typography
              sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.04em', mb: 0.5 }}
            >
              STATUS
            </Typography>
            <StatusChip
              label={section.active ? 'Active' : 'Inactive'}
              variantType={section.active ? 'success' : 'default'}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
            DESCRIPTION
          </Typography>
          <Typography sx={{ mt: 0.75, lineHeight: 1.6 }}>{section.description}</Typography>
        </Box>
      </SetupCard>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr 1fr', [screen.desktop]: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <Stat label="Total Tables" value={section.tableCount} />
        <Stat label="Total Seats" value={section.seatCount} />
        <Stat label="Active Tables" value={section.activeTableCount} />
        <Stat label="Inactive" value={section.inactiveTableCount} />
      </Box>
      <Box>
        <Stack
          direction={{ [screen.mobile]: 'column', [screen.desktop]: 'row' }}
          spacing={1.25}
          sx={{
            alignItems: { [screen.desktop]: 'center' },
            justifyContent: 'space-between',
            mb: 1.25,
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>Tables in this Section</Typography>
          <ActionButton
            startIcon={<Plus size={16} />}
            disabled={!canCreate || createTable.isPending}
            onClick={() =>
              setDraft({
                id: `t-${Date.now()}`,
                number: nextTableNames(floorTables, 1)[0] ?? 'T001',
                seats: 4,
                active: true,
                reservations: true,
                sectionId: section.id,
                area: section.name,
                shape: 'Square',
              })
            }
            sx={{ width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' } }}
          >
            Add Table
          </ActionButton>
        </Stack>
        {tables.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            No tables in this section yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tables.map((item) => (
              <Box
                key={item.id}
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  minWidth: 92,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center', color: 'primary.main' }}
                >
                  <LayoutGrid size={14} />
                  <Typography
                    sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.8125rem' }}
                  >
                    {item.number}
                  </Typography>
                </Stack>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.25 }}>
                  {item.seats} Seats
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <EditTableDialog
        table={draft}
        sections={[section]}
        saving={createTable.isPending}
        lockSection
        onClose={() => setDraft(null)}
        onSave={(next) => {
          void saveTable(next);
        }}
      />
    </Stack>
  );
}

function SectionEditor({
  section,
  onSave,
  onCancel,
}: Readonly<{
  section: CatalogSection | null;
  onSave: (section: CatalogSection) => void;
  onCancel: () => void;
}>) {
  const [draft, setDraft] = useState<CatalogSection>(
    () =>
      section ?? {
        id: 'section-draft',
        name: '',
        code: '',
        description: '',
        active: true,
        tableCount: 0,
        seatCount: 0,
        activeTableCount: 0,
        inactiveTableCount: 0,
      },
  );
  const footerTarget = useAppShellFooterTarget();

  const footer = (
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
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        variant="outlined"
        onClick={onCancel}
        sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
      >
        Cancel
      </ActionButton>
      <ActionButton
        onClick={() => onSave(draft)}
        sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
      >
        Save Changes
      </ActionButton>
    </Stack>
  );

  return (
    <>
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
            id="edit-section-name"
            label="Section Name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <Input
            id="edit-section-code"
            label="Section Code"
            value={draft.code}
            onChange={(event) => setDraft({ ...draft, code: event.target.value })}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Input
            id="edit-section-description"
            label="Description"
            value={draft.description}
            multiline
            rows={3}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <StatusRow
            title="Floor Status"
            hint="Toggle active visibility on checkout POS channels"
            checked={draft.active}
            onChange={(active) => setDraft({ ...draft, active })}
          />
        </Box>
      </SetupCard>
      {footerTarget ? createPortal(footer, footerTarget) : footer}
    </>
  );
}

function Field({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
        {label.toUpperCase()}
      </Typography>
      <Typography sx={{ fontWeight: 800, mt: 0.5 }}>{value}</Typography>
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

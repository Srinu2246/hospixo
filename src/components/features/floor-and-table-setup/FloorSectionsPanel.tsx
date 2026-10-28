'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Eye, LayoutGrid, Pencil, Plus, QrCode } from 'lucide-react';

import {
  isPersistedId,
  nextTableNames,
  numericId,
} from '@/components/features/floor-and-table-setup/EditTableDialog';
import { TableGenerateDialog } from '@/components/shared/ui/TableGenerateDialog';
import { SetupCard } from '@/components/features/floor-and-table-setup/SetupFields';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import {
  ACTIVE_STATUS_FILTER_OPTIONS,
  type ActiveStatusFilter,
  type CatalogSection,
  type CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { useCreateTable } from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import {
  canSubmitSetupForm,
  sectionFormSchema,
  type SectionFormValues,
} from '@/lib/schemas/floor-and-table-setup/floorSetupFormSchema';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { SectionQrDialog } from '@/components/features/floor-and-table-setup/SectionQrDialog';
import type { SectionGuestMenuTarget } from '@/lib/helpers/floor-and-table-setup/guestMenuUrl';
import { tableSeatSummary } from '@/lib/helpers/floorAndTableSetup';
import { screen } from '@/lib/theme/mui/breakpoints';

const compactFilterDropdownSx = {
  width: '100%',
  height: 44,
  '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const;

const catalogCardHoverSx = {
  transition: 'border-color 0.15s ease',
  '&:hover': { borderColor: 'grey.400' },
} as const;

export function FloorSectionsPanel({
  sections,
  tables,
  selected,
  editing,
  branchId,
  floorId,
  branchName,
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
  branchName?: string;
  onOpen: (sectionId: string) => void;
  onEdit: (sectionId: string) => void;
  onAdd: () => void;
  onSave: (section: CatalogSection) => void;
  onCancel: () => void;
}>) {
  const [qrSection, setQrSection] = useState<SectionGuestMenuTarget | null>(null);
  const qrDialog = (
    <SectionQrDialog
      open={qrSection != null}
      section={qrSection}
      floorId={floorId != null ? String(floorId) : null}
      outletLabel={branchName?.trim() || 'outlet'}
      outletId={branchId != null ? String(branchId) : null}
      branchId={branchId ?? null}
      onClose={() => setQrSection(null)}
    />
  );

  if (editing) {
    return (
      <>
        {qrDialog}
        <SectionEditor
          key={selected?.id ?? 'new'}
          section={selected}
          onSave={onSave}
          onCancel={onCancel}
        />
      </>
    );
  }
  if (selected) {
    return (
      <>
        {qrDialog}
        <SectionDetail
          section={selected}
          tables={tables.filter((item) => item.sectionId === selected.id)}
          floorTables={tables}
          branchId={branchId}
          floorId={floorId}
          onDownloadQr={() => setQrSection({ id: selected.id, name: selected.name })}
        />
      </>
    );
  }
  return (
    <>
      {qrDialog}
      <SectionList
        sections={sections}
        onOpen={onOpen}
        onEdit={onEdit}
        onAdd={onAdd}
        onDownloadQr={(section) => setQrSection({ id: section.id, name: section.name })}
      />
    </>
  );
}

function SectionList({
  sections,
  onOpen,
  onEdit,
  onAdd,
  onDownloadQr,
}: Readonly<{
  sections: readonly CatalogSection[];
  onOpen: (sectionId: string) => void;
  onEdit: (sectionId: string) => void;
  onAdd: () => void;
  onDownloadQr: (section: CatalogSection) => void;
}>) {
  const theme = useTheme();
  const belowDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const [status, setStatus] = useState<ActiveStatusFilter>('all');
  const filtered = sections.filter((section) => {
    if (status === 'all') return true;
    return status === 'active' ? section.active : !section.active;
  });
  const visible = belowDesktop ? filtered : sections;

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>Sections List</Typography>
            <Typography
              sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25, lineHeight: 1.45 }}
            >
              Manage and organize dining zones within this floor
            </Typography>
          </Box>
          <ActionButton
            startIcon={<Plus size={16} />}
            size="large"
            onClick={onAdd}
            sx={{ flexShrink: 0, minHeight: 44, whiteSpace: 'nowrap' }}
          >
            Add Section
          </ActionButton>
        </Stack>
        <Dropdown
          placeholder="Status"
          options={ACTIVE_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={setStatus}
          size="large"
          minWidth={0}
          sx={compactFilterDropdownSx}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>Sections List</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Manage and organize dining zones within this floor
          </Typography>
        </Box>
        <ActionButton startIcon={<Plus size={16} />} size="large" onClick={onAdd}>
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
          gap: { xs: 2, md: 2 },
        }}
      >
        {visible.length === 0 ? (
          <Typography
            sx={{ color: 'text.secondary', gridColumn: '1 / -1', py: 4, textAlign: 'center' }}
          >
            {belowDesktop ? 'No sections match this filter.' : 'No sections on this floor.'}
          </Typography>
        ) : null}
        {visible.map((section) => (
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
              p: 2,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              cursor: 'pointer',
              ...catalogCardHoverSx,
            }}
          >
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{section.name}</Typography>
              <StatusChip
                label={section.active ? 'Active' : 'Inactive'}
                variantType={section.active ? 'success' : 'default'}
              />
            </Stack>
            <Typography
              sx={{ color: 'text.secondary', mt: 1.5, fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {tableSeatSummary(section.tableCount, section.seatCount)}
            </Typography>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Typography
                sx={{ color: 'text.secondary', fontSize: '0.8125rem', minWidth: 0, flex: 1 }}
              >
                {section.code || 'No code'}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, alignItems: 'center' }}>
                <ActionButton
                  variant="outlined"
                  size="small"
                  startIcon={<QrCode size={14} />}
                  onClick={() => onDownloadQr(section)}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Download QR
                </ActionButton>
                <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
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
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}
                >
                  <ActionButton
                    variant="outlined"
                    size="small"
                    startIcon={<Eye size={15} />}
                    onClick={() => onOpen(section.id)}
                    sx={{ minHeight: 40, px: 1.5 }}
                  >
                    View
                  </ActionButton>
                  <ActionButton
                    variant="outlined"
                    size="small"
                    startIcon={<Pencil size={15} />}
                    onClick={() => onEdit(section.id)}
                    sx={{ minHeight: 40, px: 1.5 }}
                  >
                    Edit
                  </ActionButton>
                </Stack>
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
  onDownloadQr,
}: Readonly<{
  section: CatalogSection;
  tables: readonly CatalogTable[];
  floorTables: readonly CatalogTable[];
  branchId?: number;
  floorId?: number;
  onDownloadQr: () => void;
}>) {
  const [createOpen, setCreateOpen] = useState(false);
  const createTable = useCreateTable(branchId);
  const sectionId = numericId(section.id);
  const canCreate = floorId != null && sectionId != null;

  async function saveTable(name: string, seats: number) {
    if (floorId == null || sectionId == null) return;
    try {
      await createTable.mutateAsync({
        floorId,
        sectionId,
        body: {
          name: name.trim(),
          description: '',
          capacity: seats,
          sort_order: floorTables.length,
        },
      });
      setCreateOpen(false);
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  }

  return (
    <Stack spacing={2}>
      <SetupCard>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Typography sx={{ fontWeight: 800 }}>Section Information</Typography>
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<QrCode size={14} />}
            onClick={onDownloadQr}
          >
            Download QR
          </ActionButton>
        </Stack>
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
            onClick={() => setCreateOpen(true)}
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

      <TableGenerateDialog
        open={createOpen}
        mode="create"
        start={nextTableNames(floorTables, 1)[0] ?? 'T001'}
        saving={createTable.isPending}
        onClose={() => setCreateOpen(false)}
        onGenerate={(input) => {
          void saveTable(input.start, input.seats);
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
  const mode = section && isPersistedId(section.id) ? 'edit' : 'add';
  const base: CatalogSection = section ?? {
    id: 'section-draft',
    name: '',
    code: '',
    description: '',
    active: true,
    tableCount: 0,
    seatCount: 0,
    activeTableCount: 0,
    inactiveTableCount: 0,
  };
  const { control, handleSubmit, trigger, formState } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: base.name,
      code: base.code,
      description: base.description,
      active: base.active,
    },
    mode: 'onChange',
  });
  const canSave = canSubmitSetupForm(mode, formState);
  const footerTarget = useAppShellFooterTarget();

  useEffect(() => {
    void trigger();
  }, [trigger]);

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
        disabled={!canSave}
        onClick={handleSubmit((values) => {
          if (!canSave) return;
          onSave({
            ...base,
            name: values.name.trim(),
            code: values.code.trim(),
            description: values.description.trim(),
            active: mode === 'add' ? true : values.active,
          });
        })}
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
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                id="edit-section-name"
                label="Section Name"
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
                id="edit-section-code"
                label="Section Code"
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
                id="edit-section-description"
                label="Description"
                value={field.value}
                multiline
                rows={3}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <LabeledSwitch
                title="Floor Status"
                hint={
                  mode === 'add'
                    ? 'New sections are created as active.'
                    : 'Toggle active visibility on checkout POS channels'
                }
                checked={mode === 'add' ? true : field.value}
                disabled={mode === 'add'}
                onChange={field.onChange}
              />
            )}
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

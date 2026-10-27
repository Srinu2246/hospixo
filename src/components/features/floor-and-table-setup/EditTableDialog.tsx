'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import { TableReservationsField } from '@/components/shared/ui/TableGenerateDialog';
import type {
  CatalogSection,
  CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  canSubmitSetupForm,
  tableFormSchema,
  type TableFormValues,
} from '@/lib/schemas/floor-and-table-setup/floorSetupFormSchema';
import { screen } from '@/lib/theme/mui/breakpoints';

const statusOptions = [
  { id: 'active', label: 'Active', icon: <StatusDot color="success.main" /> },
  { id: 'inactive', label: 'Inactive', icon: <StatusDot color="error.main" /> },
] as const;

export function EditTableDialog({
  table,
  sections,
  saving,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable | null;
  sections: readonly CatalogSection[];
  saving: boolean;
  /** Kept so existing callers can pass it. Section stays on the table record. */
  lockSection?: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  return (
    <Modal
      open={table !== null}
      onClose={onClose}
      title={table && !isPersistedId(table.id) ? 'Add Table' : 'Edit Table'}
      width={440}
      height="auto"
    >
      {table ? (
        <EditTableForm
          key={`${table.id}-${table.seats}-${table.version ?? 0}-${table.sectionId}`}
          table={table}
          sections={sections}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Modal>
  );
}

function EditTableForm({
  table,
  sections,
  saving,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable;
  sections: readonly CatalogSection[];
  saving: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  const mode = isPersistedId(table.id) ? 'edit' : 'add';
  const { control, handleSubmit, trigger, formState } = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      number: table.number,
      seats: table.seats,
      sectionId: table.sectionId ?? '',
      active: table.active,
      reservations: table.reservations,
    },
    mode: 'onChange',
  });
  const canSave = canSubmitSetupForm(mode, formState);

  useEffect(() => {
    void trigger();
  }, [trigger]);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit((values) => {
        if (!canSave) return;
        const section = sections.find((item) => item.id === values.sectionId);
        onSave({
          ...table,
          number: values.number.trim(),
          seats: values.seats,
          sectionId: values.sectionId,
          area: section?.name ?? table.area,
          active: values.active,
          reservations: values.reservations,
        });
      })}
    >
      <Controller
        name="number"
        control={control}
        render={({ field, fieldState }) => (
          <Stack spacing={0.75}>
            <FieldLabel>Table Number</FieldLabel>
            <Input
              id="edit-table-number"
              value={field.value}
              error={fieldState.isTouched && Boolean(fieldState.error)}
              helperText={fieldState.isTouched ? fieldState.error?.message : undefined}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          </Stack>
        )}
      />
      <Controller
        name="seats"
        control={control}
        render={({ field, fieldState }) => (
          <Stack spacing={0.75}>
            <FieldLabel>Capacity</FieldLabel>
            <Input
              id="edit-table-capacity"
              value={field.value > 0 ? `${field.value} Seats` : ''}
              error={fieldState.isTouched && Boolean(fieldState.error)}
              helperText={fieldState.isTouched ? fieldState.error?.message : undefined}
              onBlur={field.onBlur}
              onChange={(event) => {
                const digits = event.target.value.replace(/[^\d]/g, '');
                field.onChange(digits === '' ? 0 : Number(digits));
              }}
            />
          </Stack>
        )}
      />
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <Stack spacing={0.75}>
            <FieldLabel>Status</FieldLabel>
            <Dropdown
              options={statusOptions}
              value={field.value ? 'active' : 'inactive'}
              onChange={(value) => field.onChange(value === 'active')}
              size="large"
              minWidth="100%"
              sx={{ width: '100%' }}
            />
          </Stack>
        )}
      />
      <Controller
        name="reservations"
        control={control}
        render={({ field }) => (
          <Stack spacing={0.75}>
            <FieldLabel>Reservations</FieldLabel>
            <TableReservationsField
              checked={field.value}
              showTitle={false}
              onChange={field.onChange}
            />
          </Stack>
        )}
      />
      <Stack
        direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <ActionButton variant="outlined" type="button" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" disabled={saving || !canSave}>
          Generate
        </ActionButton>
      </Stack>
    </Stack>
  );
}

export function nextTableNames(tables: readonly CatalogTable[], count: number): string[] {
  const used = new Set(tables.map((table) => table.number.trim().toLowerCase()));
  const names: string[] = [];
  let serial = 1;
  while (names.length < count) {
    const candidate = `T${String(serial).padStart(3, '0')}`;
    serial += 1;
    if (used.has(candidate.toLowerCase())) continue;
    used.add(candidate.toLowerCase());
    names.push(candidate);
  }
  return names;
}

export function isPersistedId(value: string | undefined): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

export function numericId(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function FieldLabel({ children }: Readonly<{ children: string }>) {
  return (
    <Typography
      sx={{
        color: 'text.secondary',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  );
}

function StatusDot({ color }: Readonly<{ color: string }>) {
  return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />;
}

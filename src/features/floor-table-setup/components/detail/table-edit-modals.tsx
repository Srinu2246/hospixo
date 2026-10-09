'use client';

import { useId, useState, type FormEvent } from 'react';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { CalendarDays, X } from 'lucide-react';

import dialogStyles from '@/features/floor-table-setup/components/add-floor/add-floor.module.css';
import { floorSetupFieldSx } from '@/features/floor-table-setup/components/shared/mui-field-styles';
import { FloorSetupSelectField } from '@/features/floor-table-setup/components/shared/floor-setup-select-field';
import { TableConfigStatusSelectField } from '@/features/floor-table-setup/components/shared/table-config-status-select-field';
import { detailCopy, tableCapacityOptions } from '@/features/floor-table-setup/config';
import type {
  FloorTableItem,
  TableConfigStatus,
  TableShape,
} from '@/features/floor-table-setup/types/floor-table-setup';

import wizardStyles from '../wizard/wizard.module.css';

export type TableEditValue = Readonly<{
  number: string;
  area: string;
  capacity: number;
  shape: TableShape;
  configStatus: TableConfigStatus;
  reservations: boolean;
}>;

export type BulkEditValue = Readonly<{
  startNumber: string;
  endNumber: string;
  capacity: number;
  configStatus: TableConfigStatus;
  reservations: boolean;
}>;

type EditTableModalProps = Readonly<{
  open: boolean;
  table: FloorTableItem | null;
  areas: readonly string[];
  onClose: () => void;
  onSave: (value: TableEditValue) => boolean | Promise<boolean>;
  statusError?: string | null;
  saving?: boolean;
}>;

function tableEditInitial(table: FloorTableItem): TableEditValue {
  return {
    number: table.number,
    area: table.area,
    capacity: table.capacity,
    shape: table.shape,
    configStatus: table.configStatus,
    reservations: table.reservations,
  };
}

export function EditTableModal({
  open,
  table,
  areas,
  onClose,
  onSave,
  statusError = null,
  saving = false,
}: EditTableModalProps) {
  if (!open || !table) return null;

  return (
    <EditTableModalForm
      key={table.id}
      table={table}
      areas={areas}
      onClose={onClose}
      onSave={onSave}
      statusError={statusError}
      saving={saving}
    />
  );
}

function EditTableModalForm({
  table,
  areas,
  onClose,
  onSave,
  statusError,
  saving = false,
}: Readonly<{
  table: FloorTableItem;
  areas: readonly string[];
  onClose: () => void;
  onSave: (value: TableEditValue) => boolean | Promise<boolean>;
  statusError?: string | null;
  saving?: boolean;
}>) {
  const titleId = useId();
  const [value, setValue] = useState(() => tableEditInitial(table));
  const [busy, setBusy] = useState(false);
  const pending = busy || saving;

  const areaOptions = areas.map((area) => ({ value: area, label: area }));
  const capacityOptions = tableCapacityOptions.map((option) => ({
    value: option,
    label: `${option} Seats`,
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.number.trim()) return;
    setBusy(true);
    try {
      const ok = await onSave(value);
      if (ok) onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={dialogStyles.overlay} role="presentation" onClick={onClose}>
      <form
        className={`${dialogStyles.dialog} ${dialogStyles.dialogWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={dialogStyles.header}>
          <h2 id={titleId} className={dialogStyles.title}>
            {detailCopy.editTableTitle}
          </h2>
          <button
            type="button"
            className={dialogStyles.close}
            onClick={onClose}
            aria-label={detailCopy.close}
          >
            <X size={16} />
          </button>
        </div>
        <Stack spacing={2} sx={{ py: 0.5 }}>
          <TextField
            fullWidth
            required
            label={detailCopy.tableNumber}
            value={value.number}
            onChange={(event) => setValue({ ...value, number: event.target.value })}
            sx={floorSetupFieldSx}
          />
          <FloorSetupSelectField
            label={detailCopy.area}
            value={value.area}
            onChange={(area) => setValue({ ...value, area })}
            options={areaOptions}
          />
          <FloorSetupSelectField
            label={detailCopy.capacity}
            value={value.capacity}
            onChange={(next) => setValue({ ...value, capacity: Number(next) })}
            options={capacityOptions}
          />
          <TableConfigStatusSelectField
            value={value.configStatus}
            onChange={(configStatus) => setValue({ ...value, configStatus })}
            error={statusError}
          />
        </Stack>
        <ReservationsField
          checked={value.reservations}
          onChange={(reservations) => setValue({ ...value, reservations })}
        />
        <div className={dialogStyles.footer}>
          <button
            type="button"
            className={dialogStyles.cancel}
            onClick={onClose}
            disabled={pending}
          >
            {detailCopy.cancel}
          </button>
          <button type="submit" className={dialogStyles.submit} disabled={pending}>
            {detailCopy.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}

type BulkEditModalProps = Readonly<{
  open: boolean;
  defaults: BulkEditValue;
  onClose: () => void;
  onApply: (value: BulkEditValue) => boolean | Promise<boolean>;
  statusError?: string | null;
}>;

export function BulkEditModal({
  open,
  defaults,
  onClose,
  onApply,
  statusError = null,
}: BulkEditModalProps) {
  if (!open) return null;

  return (
    <BulkEditModalForm
      key={`${defaults.startNumber}-${defaults.endNumber}-${defaults.capacity}`}
      defaults={defaults}
      onClose={onClose}
      onApply={onApply}
      statusError={statusError}
    />
  );
}

function BulkEditModalForm({
  defaults,
  onClose,
  onApply,
  statusError,
}: Readonly<{
  defaults: BulkEditValue;
  onClose: () => void;
  onApply: (value: BulkEditValue) => boolean | Promise<boolean>;
  statusError?: string | null;
}>) {
  const titleId = useId();
  const [value, setValue] = useState(defaults);
  const [busy, setBusy] = useState(false);

  const capacityOptions = tableCapacityOptions.map((option) => ({
    value: option,
    label: `${option} Seats`,
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const ok = await onApply(value);
      if (ok) onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={dialogStyles.overlay} role="presentation" onClick={onClose}>
      <form
        className={`${dialogStyles.dialog} ${dialogStyles.dialogWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={dialogStyles.header}>
          <div>
            <h2 id={titleId} className={dialogStyles.title}>
              {detailCopy.bulkEditTitle}
            </h2>
            <p className={dialogStyles.subtitle}>{detailCopy.bulkEditSubtitle}</p>
          </div>
          <button
            type="button"
            className={dialogStyles.close}
            onClick={onClose}
            aria-label={detailCopy.close}
          >
            <X size={16} />
          </button>
        </div>
        <Stack spacing={2} sx={{ py: 0.5 }}>
          <TextField
            fullWidth
            label={detailCopy.startNumber}
            value={value.startNumber}
            onChange={(event) => setValue({ ...value, startNumber: event.target.value })}
            sx={floorSetupFieldSx}
          />
          <TextField
            fullWidth
            label={detailCopy.endNumber}
            value={value.endNumber}
            onChange={(event) => setValue({ ...value, endNumber: event.target.value })}
            sx={floorSetupFieldSx}
          />
          <FloorSetupSelectField
            label={detailCopy.capacity}
            value={value.capacity}
            onChange={(next) => setValue({ ...value, capacity: Number(next) })}
            options={capacityOptions}
          />
          <TableConfigStatusSelectField
            value={value.configStatus}
            onChange={(configStatus) => setValue({ ...value, configStatus })}
            error={statusError}
          />
        </Stack>
        <ReservationsField
          checked={value.reservations}
          onChange={(reservations) => setValue({ ...value, reservations })}
        />
        <div className={dialogStyles.footer}>
          <button type="button" className={dialogStyles.cancel} onClick={onClose} disabled={busy}>
            {detailCopy.cancel}
          </button>
          <button type="submit" className={dialogStyles.submit} disabled={busy}>
            {detailCopy.apply}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReservationsField({
  checked,
  onChange,
}: Readonly<{
  checked: boolean;
  onChange: (value: boolean) => void;
}>) {
  return (
    <div className={wizardStyles.reserveCard}>
      <div className={wizardStyles.reserveCopy}>
        <CalendarDays className={wizardStyles.icon} aria-hidden="true" />
        <div>
          <p className={wizardStyles.reserveTitle}>{detailCopy.reservations}</p>
          <p className={wizardStyles.listSubtitle}>{detailCopy.reservationsHint}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onChange={(_, next) => onChange(next)}
        slotProps={{ input: { 'aria-label': detailCopy.reservations } }}
      />
    </div>
  );
}

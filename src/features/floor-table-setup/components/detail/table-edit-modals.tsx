'use client';

import { useId, useState, type FormEvent } from 'react';
import { CalendarDays, X } from 'lucide-react';

import dialogStyles from '@/features/floor-table-setup/components/add-floor/add-floor.module.css';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import {
  detailCopy,
  tableCapacityOptions,
  tableConfigStatusOptions,
  tableShapeOptions,
} from '@/features/floor-table-setup/config';
import { isTableConfigStatus, isTableShape } from '@/features/floor-table-setup/lib';
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
  error?: string | null;
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
  error = null,
}: EditTableModalProps) {
  if (!open || !table) return null;

  return (
    <EditTableModalForm
      key={table.id}
      table={table}
      areas={areas}
      onClose={onClose}
      onSave={onSave}
      error={error}
    />
  );
}

function EditTableModalForm({
  table,
  areas,
  onClose,
  onSave,
  error,
}: Readonly<{
  table: FloorTableItem;
  areas: readonly string[];
  onClose: () => void;
  onSave: (value: TableEditValue) => boolean | Promise<boolean>;
  error?: string | null;
}>) {
  const titleId = useId();
  const [value, setValue] = useState(() => tableEditInitial(table));
  const [busy, setBusy] = useState(false);

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
        {error ? <p className={dialogStyles.error}>{error}</p> : null}
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.tableNumber}</span>
          <input
            className={dialogStyles.input}
            value={value.number}
            onChange={(event) => setValue({ ...value, number: event.target.value })}
          />
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.area}</span>
          <select
            className={dialogStyles.select}
            value={value.area}
            onChange={(event) => setValue({ ...value, area: event.target.value })}
          >
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.capacity}</span>
          <select
            className={dialogStyles.select}
            value={value.capacity}
            onChange={(event) => setValue({ ...value, capacity: Number(event.target.value) })}
          >
            {tableCapacityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.shape}</span>
          <select
            className={dialogStyles.select}
            value={value.shape}
            onChange={(event) => {
              if (!isTableShape(event.target.value)) return;
              setValue({ ...value, shape: event.target.value });
            }}
          >
            {tableShapeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.status}</span>
          <select
            className={dialogStyles.select}
            value={value.configStatus}
            onChange={(event) => {
              if (!isTableConfigStatus(event.target.value)) return;
              setValue({ ...value, configStatus: event.target.value });
            }}
          >
            {tableConfigStatusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <ReservationsField
          checked={value.reservations}
          onChange={(reservations) => setValue({ ...value, reservations })}
        />
        <div className={dialogStyles.footer}>
          <button type="button" className={dialogStyles.cancel} onClick={onClose} disabled={busy}>
            {detailCopy.cancel}
          </button>
          <button type="submit" className={dialogStyles.submit} disabled={busy}>
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
  error?: string | null;
}>;

export function BulkEditModal({
  open,
  defaults,
  onClose,
  onApply,
  error = null,
}: BulkEditModalProps) {
  if (!open) return null;

  return (
    <BulkEditModalForm
      key={`${defaults.startNumber}-${defaults.endNumber}-${defaults.capacity}`}
      defaults={defaults}
      onClose={onClose}
      onApply={onApply}
      error={error}
    />
  );
}

function BulkEditModalForm({
  defaults,
  onClose,
  onApply,
  error,
}: Readonly<{
  defaults: BulkEditValue;
  onClose: () => void;
  onApply: (value: BulkEditValue) => boolean | Promise<boolean>;
  error?: string | null;
}>) {
  const titleId = useId();
  const [value, setValue] = useState(defaults);
  const [busy, setBusy] = useState(false);

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
        {error ? <p className={dialogStyles.error}>{error}</p> : null}
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.startNumber}</span>
          <input
            className={dialogStyles.input}
            value={value.startNumber}
            onChange={(event) => setValue({ ...value, startNumber: event.target.value })}
          />
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.endNumber}</span>
          <input
            className={dialogStyles.input}
            value={value.endNumber}
            onChange={(event) => setValue({ ...value, endNumber: event.target.value })}
          />
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.capacity}</span>
          <select
            className={dialogStyles.select}
            value={value.capacity}
            onChange={(event) => setValue({ ...value, capacity: Number(event.target.value) })}
          >
            {tableCapacityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className={dialogStyles.field}>
          <span className={dialogStyles.label}>{detailCopy.status}</span>
          <select
            className={dialogStyles.select}
            value={value.configStatus}
            onChange={(event) => {
              if (!isTableConfigStatus(event.target.value)) return;
              setValue({ ...value, configStatus: event.target.value });
            }}
          >
            {tableConfigStatusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
      <StatusToggle label={detailCopy.reservations} hint="" checked={checked} onChange={onChange} />
    </div>
  );
}

'use client';

import { Plus } from 'lucide-react';

import { FloorSetupToolbarSelect } from '@/features/floor-table-setup/components/shared/floor-setup-toolbar-select';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config';

import wizardStyles from '../wizard/wizard.module.css';

type DetailListHeaderActionsProps = Readonly<{
  status: string;
  statusOptions: readonly Readonly<{ value: string; label: string }>[];
  onStatusChange: (value: string) => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}>;

export function DetailListHeaderActions({
  status,
  statusOptions,
  onStatusChange,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
}: DetailListHeaderActionsProps) {
  return (
    <div className={wizardStyles.listHeaderActions}>
      <FloorSetupToolbarSelect
        value={status}
        aria-label={floorTableSetupCopy.statusLabel}
        onChange={onStatusChange}
        options={statusOptions}
      />
      <button
        type="button"
        className={wizardStyles.primary}
        onClick={onPrimary}
        disabled={primaryDisabled}
      >
        <Plus className={wizardStyles.icon} aria-hidden="true" />
        {primaryLabel}
      </button>
    </div>
  );
}

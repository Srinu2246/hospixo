'use client';

import { useState } from 'react';

import { FloorCreationStep } from '@/features/floor-table-setup/components/wizard/floor-creation-step';
import { detailCopy } from '@/features/floor-table-setup/config';
import { useFloorDetailMutations } from '@/features/floor-table-setup/hooks/use-floor-detail-mutations';
import { floorToDraftForm, resolveLifecycleFieldError } from '@/features/floor-table-setup/lib';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

import wizardStyles from '../wizard/wizard.module.css';

type FloorEditTabProps = Readonly<{
  floor: Floor;
  onBack: () => void;
}>;

export function FloorEditTab({ floor, onBack }: FloorEditTabProps) {
  const mutations = useFloorDetailMutations(floor.id);
  const [value, setValue] = useState(() => floorToDraftForm(floor));
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const result = await mutations.updateFloor(value, floor.version ?? 1);
      if (result.ok) onBack();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={wizardStyles.page}>
      <FloorCreationStep
        value={value}
        onChange={(next) => {
          mutations.clearError();
          setValue(next);
        }}
        title={detailCopy.floorDetailsTitle}
        errors={{
          status: resolveLifecycleFieldError(mutations.fieldErrors, mutations.error) ?? undefined,
        }}
      />
      <div className={wizardStyles.footer}>
        <button type="button" className={wizardStyles.secondary} onClick={onBack} disabled={busy}>
          {detailCopy.back}
        </button>
        <button
          type="button"
          className={wizardStyles.primary}
          onClick={() => void handleSave()}
          disabled={busy || mutations.isPending || !value.name.trim()}
        >
          {detailCopy.updateFloor}
        </button>
      </div>
    </div>
  );
}

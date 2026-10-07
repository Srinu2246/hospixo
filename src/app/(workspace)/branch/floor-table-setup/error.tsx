'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { detailCopy, floorTableSetupCopy } from '@/features/floor-table-setup/config';

import wizardStyles from '@/features/floor-table-setup/components/wizard/wizard.module.css';
import hubStyles from '@/features/floor-table-setup/components/floor-table-setup-page.module.css';

type FloorTableSetupErrorProps = Readonly<{
  reset: () => void;
}>;

export default function FloorTableSetupError({ reset }: FloorTableSetupErrorProps) {
  const router = useRouter();

  return (
    <EmptyState
      variant="error"
      title={detailCopy.errorTitle}
      description={detailCopy.errorDescription}
      icon={<ShieldAlert className={wizardStyles.icon} />}
      action={
        <>
          <button type="button" className={wizardStyles.primary} onClick={reset}>
            {detailCopy.retry}
          </button>
          <button type="button" className={hubStyles.errorLink} onClick={() => router.back()}>
            {floorTableSetupCopy.goBack}
          </button>
        </>
      }
    />
  );
}

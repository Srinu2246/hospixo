'use client';

import Link from 'next/link';
import { Eye, SquarePen } from 'lucide-react';

import { floorTableSetupCopy } from '@/features/floor-table-setup/config';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import { floorDetailPath } from '@/features/floor-table-setup/lib';

import styles from './action-buttons.module.css';

type FloorActionButtonsProps = Readonly<{
  floorId: string;
}>;

export function FloorActionButtons({ floorId }: FloorActionButtonsProps) {
  const outletId = useFloorBranchOutletId();

  return (
    <div className={styles.actions}>
      <Link
        href={floorDetailPath(floorId, undefined, outletId)}
        className={styles.iconButton}
        aria-label={floorTableSetupCopy.viewFloor}
        title={floorTableSetupCopy.viewFloor}
      >
        <Eye className={styles.icon} aria-hidden="true" />
      </Link>
      <Link
        href={floorDetailPath(floorId, 'floor', outletId)}
        className={styles.iconButton}
        aria-label={floorTableSetupCopy.editFloor}
        title={floorTableSetupCopy.editFloor}
      >
        <SquarePen className={styles.icon} aria-hidden="true" />
      </Link>
    </div>
  );
}

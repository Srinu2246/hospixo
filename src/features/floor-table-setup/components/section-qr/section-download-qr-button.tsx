'use client';

import { QrCode } from 'lucide-react';

import { sectionQrCopy } from '@/features/floor-table-setup/config/section-qr';
import { cn } from '@/lib/utils';

import styles from './section-qr.module.css';

type SectionDownloadQrButtonProps = Readonly<{
  onClick: () => void;
  compact?: boolean;
  className?: string;
}>;

export function SectionDownloadQrButton({
  onClick,
  compact = false,
  className,
}: SectionDownloadQrButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.downloadQr, compact && styles.downloadQrInCardRow, className)}
      onClick={onClick}
    >
      <QrCode className={styles.downloadQrIcon} aria-hidden="true" />
      {sectionQrCopy.downloadQr}
    </button>
  );
}

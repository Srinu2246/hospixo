'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { FloorSetupCompactStickyFooter } from '@/features/floor-table-setup/components/shared/compact-layout';
import { compactTouchButtonSx } from '@/features/floor-table-setup/components/shared/compact-layout/compact-layout-sx';
import {
  floorTypeFormLabels,
  successSummaryRows,
  wizardCopy,
} from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import { floorTableSetupPath, seatingSummary } from '@/features/floor-table-setup/lib';
import type { FloorSetupDraft } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type SuccessStepProps = Readonly<{
  draft: FloorSetupDraft;
  outletId?: string | null;
  branchName?: string | null;
}>;

export function SuccessStep({ draft, outletId = null, branchName = null }: SuccessStepProps) {
  const { isCompactLayout } = useFloorTableSetupResponsive();
  const seating = seatingSummary(draft.tables);
  const reservationsOn = draft.tables.some((table) => table.reservations);
  const floorTypeLabel =
    draft.floor.type && draft.floor.type in floorTypeFormLabels
      ? floorTypeFormLabels[draft.floor.type as keyof typeof floorTypeFormLabels]
      : '—';

  const values: Record<(typeof successSummaryRows)[number]['id'], string> = {
    name: draft.floor.name,
    seating: `${seating.tables} ${wizardCopy.tablesUnit} - ${seating.seats} ${wizardCopy.seatsUnit}`,
    reservations: reservationsOn ? wizardCopy.reservationsOnline : wizardCopy.reservationsOffline,
  };

  const hubHref = floorTableSetupPath(outletId);

  if (isCompactLayout) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          py: 2,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden
        >
          <Check size={36} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
          {wizardCopy.successTitle}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 360 }}
        >
          {wizardCopy.successDescription(draft.floor.name, branchName?.trim() || 'this outlet')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, width: '100%' }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <SummaryRow label={wizardCopy.floorName} value={draft.floor.name} />
            <SummaryRow label={wizardCopy.floorType} value={floorTypeLabel} />
            <SummaryRow label={wizardCopy.seatingSummary} value={values.seating} />
            <SummaryRow
              label={wizardCopy.reservations}
              value={values.reservations}
              highlight={reservationsOn}
            />
          </Box>
        </Paper>
        <Box sx={{ width: '100%', mt: 1 }}>
          <FloorSetupCompactStickyFooter
            back={
              <Button
                component={Link}
                href={hubHref}
                variant="outlined"
                fullWidth
                sx={compactTouchButtonSx}
              >
                {wizardCopy.successHub}
              </Button>
            }
            primary={
              <Button
                component={Link}
                href={hubHref}
                variant="contained"
                fullWidth
                sx={compactTouchButtonSx}
              >
                {wizardCopy.successSetup}
              </Button>
            }
          />
        </Box>
      </Box>
    );
  }

  return (
    <section className={styles.success}>
      <div className={styles.successIcon} aria-hidden="true">
        <Check className={styles.icon} />
      </div>
      <h1 className={styles.successTitle}>{wizardCopy.successTitle}</h1>
      <p className={styles.successText}>
        {wizardCopy.successDescription(draft.floor.name, branchName?.trim() || 'this outlet')}
      </p>
      <dl className={styles.summary}>
        {successSummaryRows.map((row) => (
          <div key={row.id} className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>{row.label}</dt>
            <dd
              className={
                row.id === 'reservations' && reservationsOn
                  ? `${styles.summaryValue} ${styles.online}`
                  : styles.summaryValue
              }
            >
              {values[row.id]}
            </dd>
          </div>
        ))}
      </dl>
      <div className={styles.successActions}>
        <Link href={hubHref} className={styles.secondary}>
          {wizardCopy.successHub}
        </Link>
        <Link href={hubHref} className={styles.primary}>
          {wizardCopy.successSetup}
        </Link>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: Readonly<{ label: string; value: string; highlight?: boolean }>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: highlight ? 'success.main' : 'text.primary',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

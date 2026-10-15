'use client';

import { LayoutGrid } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import {
  floorTypeFormLabels,
  reviewColumns,
  wizardCopy,
} from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import { formatFloorStats, seatingSummary } from '@/features/floor-table-setup/lib';
import type {
  FloorSetupDraft,
  WizardStepId,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type ReviewStepProps = Readonly<{
  draft: FloorSetupDraft;
  onEdit: (step: WizardStepId) => void;
  onToggleFloor: (active: boolean) => void;
  onToggleSection: (id: string, active: boolean) => void;
}>;

export function ReviewStep({ draft, onEdit, onToggleFloor, onToggleSection }: ReviewStepProps) {
  const { isCompactLayout } = useFloorTableSetupResponsive();
  const seating = seatingSummary(draft.tables);
  const floorTypeLabel =
    draft.floor.type && draft.floor.type in floorTypeFormLabels
      ? floorTypeFormLabels[draft.floor.type as keyof typeof floorTypeFormLabels]
      : '—';

  if (isCompactLayout) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {wizardCopy.reviewTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {wizardCopy.reviewSubtitle}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {wizardCopy.floorDetails}
            </Typography>
            <Button size="small" onClick={() => onEdit('floor')}>
              {wizardCopy.edit}
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
            <ReviewFieldCompact label={wizardCopy.floorName} value={draft.floor.name} />
            <ReviewFieldCompact label={wizardCopy.floorCode} value={draft.floor.code} />
            <ReviewFieldCompact label={wizardCopy.floorType} value={floorTypeLabel} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {wizardCopy.floorStatus}
                </Typography>
              </Box>
              <Switch
                checked={draft.floor.active}
                onChange={(_, active) => onToggleFloor(active)}
                slotProps={{ input: { 'aria-label': wizardCopy.floorStatus } }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {wizardCopy.sectionsReview}
            </Typography>
            <Button size="small" onClick={() => onEdit('section')}>
              {wizardCopy.edit}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {draft.sections.map((section) => (
              <Box
                key={section.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {section.name}
                  </Typography>
                  {section.active ? (
                    <Chip size="small" label="Active" color="success" variant="outlined" />
                  ) : (
                    <Chip size="small" label="Inactive" variant="outlined" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {section.code} · {formatFloorStats(section.tableCount, section.seatCount)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Switch
                    size="small"
                    checked={section.active}
                    onChange={(_, active) => onToggleSection(section.id, active)}
                    slotProps={{ input: { 'aria-label': section.name } }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {wizardCopy.tablesSetup}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LayoutGrid size={18} aria-hidden />
            <Typography variant="body2" color="text.secondary">
              {seating.tables} {wizardCopy.tablesConfigured}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.listCopy}>
        <h2 className={styles.listTitle}>{wizardCopy.reviewTitle}</h2>
        <p className={styles.listSubtitle}>{wizardCopy.reviewSubtitle}</p>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewHead}>
          <h3 className={styles.reviewTitle}>{wizardCopy.floorDetails}</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit('floor')}>
            {wizardCopy.edit}
          </button>
        </div>
        <div className={styles.reviewGrid}>
          <ReviewField label={wizardCopy.floorName} value={draft.floor.name} />
          <ReviewField label={wizardCopy.floorCode} value={draft.floor.code} />
          <StatusToggle
            label={wizardCopy.floorStatus}
            hint=""
            checked={draft.floor.active}
            onChange={onToggleFloor}
          />
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewHead}>
          <h3 className={styles.reviewTitle}>{wizardCopy.sectionsReview}</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit('section')}>
            {wizardCopy.edit}
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              {reviewColumns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.sections.map((section) => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{section.code}</td>
                <td>{section.tableCount}</td>
                <td>{section.seatCount}</td>
                <td>
                  <StatusToggle
                    label={section.name}
                    hint=""
                    checked={section.active}
                    onChange={(active) => onToggleSection(section.id, active)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.reviewBlock}>
        <p className={styles.reviewTitle}>{wizardCopy.tablesSetup}</p>
        <p className={styles.tablesConfigured}>
          <LayoutGrid className={styles.icon} aria-hidden="true" />
          {seating.tables} {wizardCopy.tablesConfigured}
        </p>
      </div>
    </section>
  );
}

function ReviewField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value}</span>
    </div>
  );
}

function ReviewFieldCompact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

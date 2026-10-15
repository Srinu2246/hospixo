'use client';

import { LayoutGrid, Plus, SquarePen, Trash2 } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorSetupCompactPageHeader } from '@/features/floor-table-setup/components/shared/compact-layout';
import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { wizardCopy } from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import { formatFloorStats } from '@/features/floor-table-setup/lib';
import type { SectionDraft } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type SectionCreationStepProps = Readonly<{
  sections: readonly SectionDraft[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (sectionId: string) => void;
  onDelete: (id: string) => void;
}>;

export function SectionCreationStep({
  sections,
  query,
  onQueryChange,
  onCreate,
  onEdit,
  onDelete,
}: SectionCreationStepProps) {
  const { isCompactLayout } = useFloorTableSetupResponsive();

  if (isCompactLayout && sections.length === 0 && !query) {
    return (
      <Stack spacing={3} sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          }}
          aria-hidden
        >
          <LayoutGrid size={32} />
        </Box>
        <Stack spacing={1} sx={{ maxWidth: 320, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {wizardCopy.emptySectionsTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {wizardCopy.emptySectionsDescription}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Plus size={18} aria-hidden />}
          onClick={onCreate}
          sx={{ maxWidth: 360, minHeight: 44 }}
        >
          {wizardCopy.createSection}
        </Button>
      </Stack>
    );
  }

  if (isCompactLayout) {
    return (
      <Stack spacing={2} sx={{ width: '100%' }}>
        <FloorSetupCompactPageHeader
          title={wizardCopy.sectionsTitle}
          subtitle={wizardCopy.sectionsSubtitleCompact}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} aria-hidden />}
              onClick={onCreate}
              sx={{ minHeight: 44 }}
            >
              {wizardCopy.addSection}
            </Button>
          }
        />
        <FloorSetupSearchField
          value={query}
          placeholder={wizardCopy.searchSections}
          onChange={onQueryChange}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sections.map((section) => (
            <Paper key={section.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {section.name}
                </Typography>
                {section.active ? (
                  <Chip size="small" label="Active" color="success" variant="outlined" />
                ) : (
                  <FloorStatusBadge status="inactive" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatFloorStats(section.tableCount, section.seatCount)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 0.5,
                  mt: 1,
                }}
              >
                <IconButton
                  size="small"
                  aria-label={wizardCopy.edit}
                  onClick={() => onEdit(section.id)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <SquarePen size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete section"
                  onClick={() => onDelete(section.id)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Stack>
    );
  }

  if (sections.length === 0 && !query) {
    return (
      <EmptyState
        variant="hero"
        title={wizardCopy.emptySectionsTitle}
        description={wizardCopy.emptySectionsDescription}
        icon={<Plus className={styles.icon} />}
        action={
          <button type="button" className={styles.primary} onClick={onCreate}>
            <Plus className={styles.icon} aria-hidden="true" />
            {wizardCopy.createSection}
          </button>
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.listHeader}>
        <div className={styles.listCopy}>
          <h2 className={styles.listTitle}>{wizardCopy.sectionsTitle}</h2>
          <p className={styles.listSubtitle}>{wizardCopy.sectionsSubtitle}</p>
        </div>
        <button type="button" className={styles.primary} onClick={onCreate}>
          <Plus className={styles.icon} aria-hidden="true" />
          {wizardCopy.addSection}
        </button>
      </div>
      <FloorSetupSearchField
        value={query}
        placeholder={wizardCopy.searchSections}
        onChange={onQueryChange}
      />
      <div className={styles.sectionGrid}>
        {sections.map((section) => (
          <article key={section.id} className={styles.sectionCard}>
            <div className={styles.sectionTop}>
              <h3 className={styles.sectionName}>{section.name}</h3>
              <FloorStatusBadge status={section.active ? 'active' : 'draft'} />
            </div>
            <p className={styles.stats}>
              {formatFloorStats(section.tableCount, section.seatCount)}
            </p>
            <div className={styles.iconActions}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={wizardCopy.edit}
                onClick={() => onEdit(section.id)}
              >
                <SquarePen className={styles.icon} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Delete section"
                onClick={() => onDelete(section.id)}
              >
                <Trash2 className={styles.icon} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

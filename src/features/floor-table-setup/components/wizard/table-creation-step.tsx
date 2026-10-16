'use client';

import { LayoutGrid, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorSetupCompactPageHeader } from '@/features/floor-table-setup/components/shared/compact-layout';
import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';
import { tableStatusLabels, wizardCopy } from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import type { TableDraft } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './wizard.module.css';

type TableCreationStepProps = Readonly<{
  tables: readonly TableDraft[];
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
  onBulk: () => void;
  onEdit: (tableId: string) => void;
  onDelete: (id: string) => void;
}>;

const statusDot: Record<TableDraft['status'], string> = {
  available: styles.dot,
  reserved: styles.dotReserved,
  occupied: styles.dotOccupied,
};

export function TableCreationStep({
  tables,
  query,
  onQueryChange,
  onAdd,
  onBulk,
  onEdit,
  onDelete,
}: TableCreationStepProps) {
  const { isCompactLayout, isTabletLayout } = useFloorTableSetupResponsive();

  if (isCompactLayout && tables.length === 0 && !query) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <FloorSetupCompactPageHeader
          title={wizardCopy.tablesTitle}
          subtitle={wizardCopy.tablesSubtitle}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} aria-hidden />}
              onClick={onAdd}
              sx={{ minHeight: 44 }}
            >
              {wizardCopy.addTable}
            </Button>
          }
        />
        <FloorSetupSearchField
          value={query}
          placeholder={wizardCopy.searchTables}
          onChange={onQueryChange}
        />
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button variant="outlined" fullWidth sx={{ minHeight: 44 }} disabled>
            {wizardCopy.bulkEdit}
          </Button>
          <Button variant="outlined" fullWidth sx={{ minHeight: 44 }} onClick={onBulk}>
            {wizardCopy.bulkGenerate}
          </Button>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2.5,
            py: 4,
          }}
        >
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
          <Box sx={{ textAlign: 'center', maxWidth: 320, px: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {wizardCopy.emptyTablesTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {wizardCopy.emptyTablesDescription}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Plus size={18} aria-hidden />}
            onClick={onAdd}
            sx={{ maxWidth: 360, minHeight: 44 }}
          >
            {wizardCopy.addFirstTable}
          </Button>
        </Box>
      </Box>
    );
  }

  if (isCompactLayout) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <FloorSetupCompactPageHeader
          title={wizardCopy.tablesTitle}
          subtitle={wizardCopy.tablesSubtitle}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} aria-hidden />}
              onClick={onAdd}
              sx={{ minHeight: 44 }}
            >
              {wizardCopy.addTable}
            </Button>
          }
        />
        <FloorSetupSearchField
          value={query}
          placeholder={wizardCopy.searchTables}
          onChange={onQueryChange}
        />
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button variant="outlined" fullWidth sx={{ minHeight: 44 }} disabled>
            {wizardCopy.bulkEdit}
          </Button>
          <Button variant="outlined" fullWidth sx={{ minHeight: 44 }} onClick={onBulk}>
            {wizardCopy.bulkGenerate}
          </Button>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isTabletLayout
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(2, minmax(0, 1fr))',
            gap: 1.5,
            width: '100%',
          }}
        >
          {tables.map((table) => (
            <Paper key={table.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {table.number}
                </Typography>
                <Chip
                  size="small"
                  label={tableStatusLabels[table.status]}
                  color={table.status === 'available' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                {table.capacity} {wizardCopy.columnSeats}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }}>
                <IconButton
                  size="small"
                  aria-label={wizardCopy.edit}
                  onClick={() => onEdit(table.id)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <SquarePen size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete table"
                  onClick={() => onDelete(table.id)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.listHeader}>
        <div className={styles.listCopy}>
          <h2 className={styles.listTitle}>{wizardCopy.tablesTitle}</h2>
          <p className={styles.listSubtitle}>{wizardCopy.tablesSubtitle}</p>
        </div>
        <button type="button" className={styles.primary} onClick={onAdd}>
          <Plus className={styles.icon} aria-hidden="true" />
          {wizardCopy.addTable}
        </button>
      </div>
      <div className={styles.toolbarRow}>
        <label className={styles.search}>
          <Search className={styles.icon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder={wizardCopy.searchTables}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary}>
            {wizardCopy.bulkEdit}
          </button>
          <button type="button" className={styles.secondary} onClick={onBulk}>
            {wizardCopy.bulkGenerate}
          </button>
        </div>
      </div>
      {tables.length === 0 ? (
        <EmptyState
          variant="hero"
          title={wizardCopy.emptyTablesTitle}
          description={wizardCopy.emptyTablesDescription}
          icon={<LayoutGrid className={styles.icon} />}
          action={
            <button type="button" className={styles.primary} onClick={onAdd}>
              <Plus className={styles.icon} aria-hidden="true" />
              {wizardCopy.addFirstTable}
            </button>
          }
        />
      ) : (
        <div className={styles.tileGrid}>
          {tables.map((table) => (
            <article key={table.id} className={styles.tableTile}>
              <div className={styles.tileTop}>
                <h3 className={styles.tableId}>{table.number}</h3>
                <span className={styles.stats}>
                  {table.capacity} {wizardCopy.columnSeats}
                </span>
              </div>
              <span className={styles.statusDot}>
                <span className={cn(styles.dot, statusDot[table.status])} aria-hidden="true" />
                {tableStatusLabels[table.status]}
              </span>
              <div className={styles.iconActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={wizardCopy.edit}
                  onClick={() => onEdit(table.id)}
                >
                  <SquarePen className={styles.icon} />
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Delete table"
                  onClick={() => onDelete(table.id)}
                >
                  <Trash2 className={styles.icon} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

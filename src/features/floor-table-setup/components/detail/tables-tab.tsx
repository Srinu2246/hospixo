'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, SquarePen, Trash2 } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { TableModal } from '@/features/floor-table-setup/components/wizard/table-modals';
import {
  createTableDefaults,
  detailCopy,
  floorTableSetupCopy,
  sectionCodePrefix,
  tableColumnKeys,
  tableConfigStatusOptions,
  tableViewOptions,
  wizardCopy,
} from '@/features/floor-table-setup/config';
import { useFloorDetailMutations } from '@/features/floor-table-setup/hooks/use-floor-detail-mutations';
import {
  filterByQuery,
  generateTables,
  nextEntityCode,
  nextTableNumber,
  parseTableSectionChoice,
  resolveLifecycleFieldError,
  validateTableNumberRange,
} from '@/features/floor-table-setup/lib';
import type {
  Floor,
  FloorTableItem,
  TableViewId,
} from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import wizardStyles from '../wizard/wizard.module.css';
import styles from './floor-detail-page.module.css';
import {
  BulkEditModal,
  EditTableModal,
  type BulkEditValue,
  type TableEditValue,
} from './table-edit-modals';

type TablesTabProps = Readonly<{
  floor: Floor;
  tables: readonly FloorTableItem[];
}>;

export function TablesTab({ floor, tables }: TablesTabProps) {
  const mutations = useFloorDetailMutations(floor.id);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<TableViewId>('grid');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      filterByQuery(
        tables,
        query,
        (table) => `${table.number} ${table.area} ${table.configStatus}`,
      ),
    [tables, query],
  );
  const areas = useMemo(
    () => [...new Set(floor.sections.map((section) => section.name))],
    [floor.sections],
  );
  const tableSections = useMemo(
    () => floor.sections.map((section) => ({ id: section.id, name: section.name })),
    [floor.sections],
  );
  const editing = tables.find((table) => table.id === editingId) ?? null;
  const bulkDefaults = useMemo((): BulkEditValue => {
    return {
      startNumber:
        tables.find((table) => table.id === selected[0])?.number ?? createTableDefaults.startNumber,
      endNumber:
        tables.find((table) => table.id === selected.at(-1))?.number ??
        createTableDefaults.startNumber,
      capacity: createTableDefaults.capacity,
      configStatus: tableConfigStatusOptions[0].id,
      reservations: createTableDefaults.reservations,
    };
  }, [selected, tables]);

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleEdit(id: string, value: TableEditValue): Promise<boolean> {
    const table = tables.find((item) => item.id === id);
    if (!table?.sectionId) return false;

    const targetSection = floor.sections.find((section) => section.name === value.area);
    if (!targetSection) return false;

    let sectionId = table.sectionId;
    let version = table.version ?? 0;

    if (targetSection.id !== table.sectionId) {
      const moved = await mutations.moveTable(table.sectionId, id, targetSection.id, version);
      if (!moved) return false;
      sectionId = targetSection.id;
      version += 1;
    }

    const patch = {
      number: value.number.trim(),
      capacity: value.capacity,
      shape: table.shape,
      configStatus: value.configStatus,
      reservations: value.reservations,
    };

    const result = await mutations.updateTable(sectionId, id, patch, version);
    if (result.ok) setEditingId(null);
    return result.ok;
  }

  async function handleBulk(value: BulkEditValue): Promise<boolean> {
    const ids = new Set(selected);
    const selectedTables = tables.filter((table) => ids.has(table.id));
    if (selectedTables.length === 0) return false;

    const patched = selectedTables.map((table) => ({
      ...table,
      capacity: value.capacity,
      configStatus: value.configStatus,
      reservations: value.reservations,
    }));

    const bySection = new Map<string, FloorTableItem[]>();
    for (const table of patched) {
      const sectionId = table.sectionId;
      if (!sectionId) continue;
      const group = bySection.get(sectionId) ?? [];
      group.push(table);
      bySection.set(sectionId, group);
    }

    for (const [sectionId, sectionTables] of bySection) {
      const result = await mutations.bulkUpdateTables(sectionId, sectionTables);
      if (!result) return false;
    }

    setSelected([]);
    return true;
  }

  async function handleCreate(value: {
    startNumber: string;
    count: number;
    capacity: number;
    reservations: boolean;
    sectionId?: string;
    newSection?: { name: string; code: string };
  }): Promise<boolean> {
    const rangeCheck = validateTableNumberRange(tables, value.startNumber, value.count);
    if (!rangeCheck.ok) {
      mutations.reportError(rangeCheck.message);
      return false;
    }

    const choice = parseTableSectionChoice(value);
    let sectionId: string | undefined;
    if (choice.kind === 'new') {
      const createdId = await mutations.createSectionId({
        name: choice.section.name,
        code: choice.section.code,
        description: '',
        active: true,
      });
      if (!createdId) return false;
      sectionId = createdId;
    } else if (choice.kind === 'existing') {
      sectionId = choice.sectionId;
    } else {
      sectionId = floor.sections[0]?.id;
    }
    if (!sectionId) return false;

    const drafts = generateTables({
      startNumber: value.startNumber,
      count: value.count,
      capacity: value.capacity,
      reservations: value.reservations,
      existing: tables,
    });

    return mutations.bulkCreateTables(sectionId, drafts);
  }

  async function handleDelete(table: FloorTableItem): Promise<void> {
    if (!table.sectionId) return;
    const result = await mutations.archiveTable(table.sectionId, table.id, table.version ?? 1);
    if (result) {
      setSelected((current) => current.filter((id) => id !== table.id));
    }
  }

  return (
    <div className={wizardStyles.page}>
      <div className={wizardStyles.listHeader}>
        <div className={wizardStyles.listCopy}>
          <h2 className={wizardStyles.listTitle}>{detailCopy.tablesTitle}</h2>
          <p className={wizardStyles.listSubtitle}>{detailCopy.tablesSubtitle}</p>
        </div>
        <button
          type="button"
          className={wizardStyles.primary}
          onClick={() => {
            mutations.clearError();
            setCreateOpen(true);
          }}
          disabled={mutations.isPending || !mutations.scopeReady}
        >
          <Plus className={wizardStyles.icon} aria-hidden="true" />
          {detailCopy.addTable}
        </button>
      </div>
      <div className={wizardStyles.toolbarRow}>
        <label className={wizardStyles.search}>
          <Search className={wizardStyles.icon} aria-hidden="true" />
          <input
            className={wizardStyles.searchInput}
            type="search"
            value={query}
            placeholder={detailCopy.searchTables}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className={styles.viewToggle} role="group">
          {tableViewOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={wizardStyles.secondary}
          onClick={() => {
            mutations.clearError();
            setBulkOpen(true);
          }}
          disabled={selected.length === 0 || mutations.isPending}
        >
          {detailCopy.bulkEdit}
        </button>
        <button
          type="button"
          className={wizardStyles.secondary}
          onClick={() => {
            mutations.clearError();
            setBulkGenerateOpen(true);
          }}
          disabled={mutations.isPending || !mutations.scopeReady}
        >
          {wizardCopy.bulkGenerate}
        </button>
      </div>
      {selected.length > 0 ? (
        <div className={styles.banner}>
          <p className={styles.bannerText}>{detailCopy.selectedCount(selected.length)}</p>
          <div className={styles.bannerActions}>
            <button
              type="button"
              className={wizardStyles.secondary}
              onClick={() => setSelected([])}
            >
              {detailCopy.clearSelection}
            </button>
            <button
              type="button"
              className={wizardStyles.primary}
              onClick={() => {
                mutations.clearError();
                setBulkOpen(true);
              }}
              disabled={mutations.isPending}
            >
              {detailCopy.bulkEdit}
            </button>
          </div>
        </div>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState
          variant="hero"
          title={detailCopy.emptyTablesTitle}
          description={detailCopy.emptyTablesDescription}
          action={
            <button
              type="button"
              className={wizardStyles.primary}
              onClick={() => setCreateOpen(true)}
              disabled={!mutations.scopeReady}
            >
              <Plus className={wizardStyles.icon} aria-hidden="true" />
              {detailCopy.addTable}
            </button>
          }
        />
      ) : view === 'table' ? (
        <div className={styles.dataTableWrap}>
          <table className={wizardStyles.table}>
            <thead>
              <tr>
                {tableColumnKeys.map((column) => (
                  <th key={column.id}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((table) => (
                <tr key={table.id}>
                  <td>{table.number}</td>
                  <td>{table.area}</td>
                  <td>{table.capacity}</td>
                  <td>
                    <FloorStatusBadge status={table.configStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={wizardStyles.tileGrid}>
          {visible.map((table) => (
            <article
              key={table.id}
              className={cn(
                wizardStyles.tableTile,
                selected.includes(table.id) && styles.tileSelected,
              )}
            >
              <label className={styles.tileSelect}>
                <input
                  type="checkbox"
                  checked={selected.includes(table.id)}
                  onChange={() => toggleSelected(table.id)}
                />
                {table.area}
              </label>
              <div className={wizardStyles.tileTop}>
                <h3 className={wizardStyles.tableId}>{table.number}</h3>
                <span className={wizardStyles.stats}>
                  {table.capacity} {floorTableSetupCopy.seatsSuffix}
                </span>
              </div>
              <div className={styles.tileFooter}>
                <FloorStatusBadge status={table.configStatus} />
                <div className={`${wizardStyles.iconActions} ${styles.tileFooterActions}`}>
                  <button
                    type="button"
                    className={wizardStyles.iconButton}
                    aria-label={detailCopy.edit}
                    onClick={() => {
                      mutations.clearError();
                      setEditingId(table.id);
                    }}
                    disabled={mutations.isPending}
                  >
                    <SquarePen className={wizardStyles.icon} />
                  </button>
                  <button
                    type="button"
                    className={wizardStyles.iconButton}
                    aria-label={detailCopy.deleteTable}
                    onClick={() => void handleDelete(table)}
                    disabled={mutations.isPending}
                  >
                    <Trash2 className={wizardStyles.icon} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className={wizardStyles.footer}>
        <span />
        <button type="button" className={wizardStyles.primary}>
          {detailCopy.setupPermissions}
        </button>
      </div>
      <TableModal
        open={createOpen}
        mode="single"
        defaultStart={nextTableNumber(tables)}
        existingTables={tables}
        sections={tableSections}
        defaultSectionId={floor.sections[0]?.id}
        defaultSectionCode={nextEntityCode(
          sectionCodePrefix,
          floor.sections.map((section) => ({ code: section.code ?? '' })),
        )}
        onClose={() => setCreateOpen(false)}
        onGenerate={handleCreate}
      />
      <TableModal
        open={bulkGenerateOpen}
        mode="bulk"
        defaultStart={nextTableNumber(tables)}
        existingTables={tables}
        sections={tableSections}
        defaultSectionId={floor.sections[0]?.id}
        defaultSectionCode={nextEntityCode(
          sectionCodePrefix,
          floor.sections.map((section) => ({ code: section.code ?? '' })),
        )}
        onClose={() => setBulkGenerateOpen(false)}
        onGenerate={handleCreate}
      />
      <EditTableModal
        open={Boolean(editing)}
        table={editing}
        areas={areas.length > 0 ? areas : [floor.name]}
        statusError={resolveLifecycleFieldError(mutations.fieldErrors, mutations.error)}
        saving={mutations.isPending}
        onClose={() => {
          mutations.clearError();
          setEditingId(null);
        }}
        onSave={async (value) => {
          if (!editing) return false;
          mutations.clearError();
          const ok = await handleEdit(editing.id, value);
          if (ok) mutations.clearError();
          return ok;
        }}
      />
      <BulkEditModal
        open={bulkOpen}
        defaults={bulkDefaults}
        statusError={resolveLifecycleFieldError(mutations.fieldErrors, mutations.error)}
        onClose={() => {
          mutations.clearError();
          setBulkOpen(false);
        }}
        onApply={handleBulk}
      />
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, SquarePen, Trash2 } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { SectionModal } from '@/features/floor-table-setup/components/wizard/section-modal';
import { detailCopy, sectionCodePrefix, wizardCopy } from '@/features/floor-table-setup/config';
import { useFloorDetailMutations } from '@/features/floor-table-setup/hooks/use-floor-detail-mutations';
import {
  filterByQuery,
  formatFloorStats,
  nextEntityCode,
  resolveLifecycleFieldError,
  sectionToDraft,
  tablesForSection,
} from '@/features/floor-table-setup/lib';
import type {
  Floor,
  FloorSection,
  FloorTableItem,
  SectionDraft,
} from '@/features/floor-table-setup/types/floor-table-setup';
import wizardStyles from '../wizard/wizard.module.css';
import styles from './floor-detail-page.module.css';
import { SectionDetail } from './section-detail';
import { SectionEditForm } from './section-edit-form';

type SectionsView = 'list' | 'detail' | 'edit';

type SectionsTabProps = Readonly<{
  floor: Floor;
  tables: readonly FloorTableItem[];
}>;

export function SectionsTab({ floor, tables }: SectionsTabProps) {
  const mutations = useFloorDetailMutations(floor.id);
  const [sections, setSections] = useState<FloorSection[]>(() => [...floor.sections]);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<SectionsView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SectionDraft | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const visible = useMemo(
    () => filterByQuery(sections, query, (section) => `${section.name} ${section.code ?? ''}`),
    [sections, query],
  );
  const selected = sections.find((section) => section.id === selectedId);
  const editingSection = editingSectionId
    ? sections.find((section) => section.id === editingSectionId)
    : null;

  function openDetail(id: string) {
    setSelectedId(id);
    setView('detail');
  }

  function openEdit(section: FloorSection) {
    setSelectedId(section.id);
    setDraft(sectionToDraft(section));
    setView('edit');
  }

  async function addSection(input: {
    name: string;
    code: string;
    description: string;
    active: boolean;
  }) {
    const result = await mutations.createSection(input);
    if (result) {
      setCreateOpen(false);
    }
    return result;
  }

  const createCode = nextEntityCode(
    sectionCodePrefix,
    sections.map((section) => ({ code: section.code ?? '' })),
  );

  async function saveDraft() {
    if (!draft) return;
    const result = await mutations.updateSection(draft.id, draft);
    if (result.ok) {
      setSections((current) =>
        current.map((section) =>
          section.id === draft.id
            ? {
                ...section,
                name: draft.name.trim(),
                code: draft.code.trim(),
                description: draft.description.trim(),
                status: draft.active ? 'active' : 'inactive',
              }
            : section,
        ),
      );
      setView('detail');
    }
  }

  async function deleteSection(section: FloorSection) {
    const result = await mutations.archiveSection(section.id, section.version ?? 1);
    if (result) {
      setSections((current) => current.filter((item) => item.id !== section.id));
    }
  }

  if (view === 'edit' && draft) {
    return (
      <SectionEditForm
        value={draft}
        onChange={(next) => {
          mutations.clearError();
          setDraft(next);
        }}
        onCancel={() => setView(selected ? 'detail' : 'list')}
        onSave={() => saveDraft()}
        loading={mutations.isPending}
        statusError={resolveLifecycleFieldError(mutations.fieldErrors, mutations.error)}
      />
    );
  }

  if (view === 'detail' && selected) {
    return (
      <SectionDetail
        section={selected}
        tables={tablesForSection(tables, selected.id)}
        onBack={() => setView('list')}
        onEdit={() => openEdit(selected)}
      />
    );
  }

  if (sections.length === 0 && !query) {
    return (
      <>
        {mutations.error ? (
          <p className={wizardStyles.formError} role="alert">
            {mutations.error}
          </p>
        ) : null}
        <EmptyState
          variant="hero"
          title={detailCopy.emptySectionsTitle}
          description={detailCopy.emptySectionsDescription}
          icon={<Plus className={wizardStyles.icon} />}
          action={
            <button
              type="button"
              className={wizardStyles.primary}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className={wizardStyles.icon} aria-hidden="true" />
              {wizardCopy.createSection}
            </button>
          }
        />
        <SectionModal
          open={createOpen}
          defaultCode={createCode}
          onClose={() => setCreateOpen(false)}
          onSubmit={(input) => addSection(input)}
        />
      </>
    );
  }

  return (
    <div className={wizardStyles.page}>
      {mutations.error ? (
        <p className={wizardStyles.formError} role="alert">
          {mutations.error}
        </p>
      ) : null}
      <div className={wizardStyles.listHeader}>
        <div className={wizardStyles.listCopy}>
          <h2 className={wizardStyles.listTitle}>{detailCopy.sectionsTitle}</h2>
          <p className={wizardStyles.listSubtitle}>{detailCopy.sectionsSubtitle}</p>
        </div>
        <button
          type="button"
          className={wizardStyles.primary}
          onClick={() => {
            setEditingSectionId(null);
            setCreateOpen(true);
          }}
        >
          <Plus className={wizardStyles.icon} aria-hidden="true" />
          {detailCopy.addSection}
        </button>
      </div>
      <label className={wizardStyles.search}>
        <Search className={wizardStyles.icon} aria-hidden="true" />
        <input
          className={wizardStyles.searchInput}
          type="search"
          value={query}
          placeholder={detailCopy.searchSections}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={wizardStyles.sectionGrid}>
        {visible.map((section) => (
          <article key={section.id} className={wizardStyles.sectionCard}>
            <button
              type="button"
              className={styles.sectionCardButton}
              onClick={() => openDetail(section.id)}
            >
              <div className={wizardStyles.sectionTop}>
                <h3 className={wizardStyles.sectionName}>{section.name}</h3>
                <FloorStatusBadge status={section.status} />
              </div>
              <p className={wizardStyles.stats}>
                {formatFloorStats(section.tableCount, section.seatCount)}
              </p>
            </button>
            <div className={wizardStyles.iconActions}>
              <button
                type="button"
                className={wizardStyles.iconButton}
                aria-label={detailCopy.edit}
                onClick={() => openEdit(section)}
              >
                <SquarePen className={wizardStyles.icon} />
              </button>
              <button
                type="button"
                className={wizardStyles.iconButton}
                aria-label={detailCopy.deleteSection}
                onClick={() => void deleteSection(section)}
              >
                <Trash2 className={wizardStyles.icon} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <SectionModal
        open={createOpen}
        defaultCode={createCode}
        initial={
          editingSection
            ? {
                name: editingSection.name,
                code: editingSection.code ?? '',
                description: editingSection.description ?? '',
                active: editingSection.status === 'active',
              }
            : undefined
        }
        title={editingSection ? detailCopy.editSection : undefined}
        submitLabel={editingSection ? detailCopy.saveChanges : undefined}
        onClose={() => {
          setCreateOpen(false);
          setEditingSectionId(null);
        }}
        onSubmit={async (input) => {
          if (editingSection) {
            const result = await mutations.updateSection(editingSection.id, {
              id: editingSection.id,
              name: input.name,
              code: input.code,
              description: input.description,
              active: input.active,
              tableCount: editingSection.tableCount,
              seatCount: editingSection.seatCount,
              version: editingSection.version ?? 1,
            });
            if (result.ok) {
              setCreateOpen(false);
              setEditingSectionId(null);
            }
            return result.ok;
          }
          return addSection(input);
        }}
      />
    </div>
  );
}

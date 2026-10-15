'use client';

import { useMemo, useState } from 'react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { SectionDownloadQrButton } from '@/features/floor-table-setup/components/section-qr/section-download-qr-button';
import { SectionQrDialog } from '@/features/floor-table-setup/components/section-qr/section-qr-dialog';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import { DetailListHeaderActions } from '@/features/floor-table-setup/components/shared/detail-list-header-actions';
import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';
import { SectionModal } from '@/features/floor-table-setup/components/wizard/section-modal';
import {
  detailCopy,
  sectionCodePrefix,
  sectionStatusFilterOptions,
  wizardCopy,
} from '@/features/floor-table-setup/config';
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
  SectionStatusFilter,
} from '@/features/floor-table-setup/types/floor-table-setup';
import wizardStyles from '../wizard/wizard.module.css';
import listCardStyles from './section-list-card.module.css';
import { SectionDetail } from './section-detail';
import { SectionEditForm } from './section-edit-form';

type SectionsView = 'list' | 'detail' | 'edit';

type SectionsTabProps = Readonly<{
  floor: Floor;
  tables: readonly FloorTableItem[];
}>;

export function SectionsTab({ floor, tables }: SectionsTabProps) {
  const mutations = useFloorDetailMutations(floor.id);
  const outletId = useFloorBranchOutletId();
  const [sections, setSections] = useState<FloorSection[]>(() => [...floor.sections]);
  const [qrSection, setQrSection] = useState<FloorSection | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SectionStatusFilter>('all');
  const [view, setView] = useState<SectionsView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SectionDraft | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const sectionStatusOptions = useMemo(
    () => sectionStatusFilterOptions.map((option) => ({ value: option.id, label: option.label })),
    [],
  );

  const visible = useMemo(() => {
    const searched = filterByQuery(
      sections,
      query,
      (section) => `${section.name} ${section.code ?? ''}`,
    );
    if (statusFilter === 'all') return searched;
    return searched.filter((section) => section.status === statusFilter);
  }, [sections, query, statusFilter]);
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
        <DetailListHeaderActions
          status={statusFilter}
          statusOptions={sectionStatusOptions}
          onStatusChange={(value) => setStatusFilter(value as SectionStatusFilter)}
          primaryLabel={detailCopy.addSection}
          onPrimary={() => {
            setEditingSectionId(null);
            setCreateOpen(true);
          }}
          primaryDisabled={mutations.isPending}
        />
      </div>
      <FloorSetupSearchField
        value={query}
        placeholder={detailCopy.searchSections}
        onChange={setQuery}
      />
      <div className={wizardStyles.sectionGrid}>
        {visible.map((section) => (
          <article key={section.id} className={listCardStyles.card}>
            <button
              type="button"
              className={listCardStyles.body}
              onClick={() => openDetail(section.id)}
            >
              <div className={listCardStyles.header}>
                <h3 className={listCardStyles.name}>{section.name}</h3>
                <FloorStatusBadge status={section.status} />
              </div>
              <p className={listCardStyles.stats}>
                {formatFloorStats(section.tableCount, section.seatCount)}
              </p>
            </button>
            <div className={listCardStyles.footer}>
              <SectionDownloadQrButton
                className={listCardStyles.downloadQr}
                onClick={() => setQrSection(section)}
              />
              <div className={listCardStyles.iconGroup}>
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
            </div>
          </article>
        ))}
      </div>
      <SectionQrDialog
        open={qrSection != null}
        section={qrSection}
        outletLabel={floor.branch || floor.name}
        outletId={outletId}
        onClose={() => setQrSection(null)}
      />
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

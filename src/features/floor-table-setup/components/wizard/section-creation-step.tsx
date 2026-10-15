import { Plus, SquarePen, Trash2 } from 'lucide-react';

import { EmptyState } from '@/features/floor-table-setup/components/empty-state';
import { FloorSetupSearchField } from '@/features/floor-table-setup/components/shared/floor-setup-search-field';
import { FloorStatusBadge } from '@/features/floor-table-setup/components/status-badge';
import { wizardCopy } from '@/features/floor-table-setup/config';
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

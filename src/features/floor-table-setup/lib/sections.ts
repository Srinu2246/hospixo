import type {
  FloorSection,
  SectionDraft,
} from '@/features/floor-table-setup/types/floor-table-setup';

type SectionLike = Readonly<{
  id: string;
  isDefault?: boolean;
  tableCount?: number;
  seatCount?: number;
}>;

/** Hide backend auto-provisioned default sections until they hold tables/seats. */
export function isVisibleSection(section: SectionLike): boolean {
  if (!section.isDefault) return true;
  return (section.tableCount ?? 0) > 0 || (section.seatCount ?? 0) > 0;
}

export function userFacingSections<T extends SectionLike>(sections: readonly T[]): T[] {
  return sections.filter(isVisibleSection);
}

export function resolvePrimarySectionId(sections: readonly SectionLike[]): string | undefined {
  const visible = userFacingSections(sections);
  if (visible.length > 0) return visible[0]?.id;
  return sections[0]?.id;
}

export function isFloorSection(value: FloorSection | SectionDraft): value is FloorSection {
  return 'status' in value;
}

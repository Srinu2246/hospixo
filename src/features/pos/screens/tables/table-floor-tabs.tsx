import type { PosFloor } from '@/features/pos/config/tables';

import styles from './table-floor-tabs.module.css';

interface TableFloorTabsProps {
  floors: PosFloor[];
  activeFloorId: string;
  onChange: (floorId: string) => void;
}

export function TableFloorTabs({ floors, activeFloorId, onChange }: Readonly<TableFloorTabsProps>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Restaurant floors">
      {floors.map((floor) => {
        const active = floor.id === activeFloorId;
        return (
          <button
            key={floor.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            onClick={() => onChange(floor.id)}
          >
            {floor.label}
          </button>
        );
      })}
    </div>
  );
}

import { FloorCard } from '@/features/floor-table-setup/components/floor-card';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './floor-grid.module.css';

type FloorGridProps = Readonly<{
  floors: readonly Floor[];
}>;

export function FloorGrid({ floors }: FloorGridProps) {
  return (
    <div className={styles.grid}>
      {floors.map((floor) => (
        <FloorCard key={floor.id} floor={floor} />
      ))}
    </div>
  );
}

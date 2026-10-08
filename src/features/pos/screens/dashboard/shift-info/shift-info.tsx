import type { ShiftInfo } from '@/features/pos/config/dashboard';

import styles from './shift-info.module.css';

interface ShiftInfoPanelProps {
  shift: ShiftInfo;
}

export function ShiftInfoPanel({ shift }: Readonly<ShiftInfoPanelProps>) {
  return (
    <section className={styles.panel} aria-labelledby="shift-info-title">
      <header className={styles.header}>
        <h2 id="shift-info-title" className={styles.title}>
          Shift Information
        </h2>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Started</th>
              <th scope="col">Orders Handled</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{shift.started}</td>
              <td>{shift.ordersHandled}</td>
              <td>
                <span className={styles.statusOpen}>{shift.status}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

import styles from './stats-cards.module.css';

export type UsersKpiId = 'total' | 'active' | 'invited' | 'roles';

type StatsCardsProps = Readonly<{
  totalUsers: number;
  activeNow: number;
  pendingInvites: number;
  userRoles: number;
  selectedId?: UsersKpiId;
  onSelect?: (id: UsersKpiId) => void;
}>;

const KPI_ITEMS: ReadonlyArray<{
  id: UsersKpiId;
  label: string;
  valueKey: keyof Omit<StatsCardsProps, 'selectedId' | 'onSelect'>;
  details: string;
}> = [
  { id: 'total', label: 'Total Users', valueKey: 'totalUsers', details: 'all team members' },
  { id: 'active', label: 'Active Now', valueKey: 'activeNow', details: 'active users' },
  { id: 'invited', label: 'Pending Invites', valueKey: 'pendingInvites', details: 'invited users' },
  { id: 'roles', label: 'User Roles', valueKey: 'userRoles', details: 'users grouped by role' },
];

export function StatsCards({
  totalUsers,
  activeNow,
  pendingInvites,
  userRoles,
  selectedId = 'total',
  onSelect,
}: StatsCardsProps) {
  const values = { totalUsers, activeNow, pendingInvites, userRoles };

  return (
    <div className={styles.grid} role="group" aria-label="Filter users by summary">
      {KPI_ITEMS.map((stat) => {
        const selected = selectedId === stat.id;
        return (
          <button
            key={stat.id}
            type="button"
            aria-pressed={selected}
            className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
            onClick={() => onSelect?.(stat.id)}
          >
            <p className={styles.label}>{stat.label}</p>
            <p className={styles.value}>{values[stat.valueKey]}</p>
            <span className={styles.hint}>
              {selected ? `Showing ${stat.details}` : `View ${stat.details}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import type {
  MenuAvailabilityStats,
  MenuStatusFilter,
} from '@/features/pos/types/menu-availability';

type MenuStatsProps = Readonly<{
  stats: MenuAvailabilityStats;
  activeFilter: MenuStatusFilter;
  onFilterChange: (filter: MenuStatusFilter) => void;
}>;

const TONE_COLORS = {
  total: '#2563eb',
  available: '#16a34a',
  eightySixed: '#dc2626',
  hidden: '#94a3b8',
};

function StatCard({
  filter,
  label,
  value,
  dotColor,
  active,
  onSelect,
}: Readonly<{
  filter: MenuStatusFilter;
  label: string;
  value: number;
  dotColor: string;
  active: boolean;
  onSelect: (filter: MenuStatusFilter) => void;
}>) {
  return (
    <ButtonBase
      component="button"
      role="button"
      aria-pressed={active}
      onClick={() => onSelect(filter)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.7,
        p: 2,
        borderRadius: 2.5,
        bgcolor: active ? '#eff6ff' : 'background.paper',
        border: '1px solid',
        borderColor: active ? '#93c5fd' : 'divider',
        boxShadow: active ? '0 0 0 1px #93c5fd' : 'none',
        textAlign: 'left',
        width: '100%',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
        '&:hover': {
          bgcolor: active ? '#eff6ff' : 'action.hover',
          borderColor: active ? '#93c5fd' : 'grey.400',
        },
        '&:focus-visible': {
          outline: '2px solid #2563eb',
          outlineOffset: '2px',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'text.secondary',
        }}
      >
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 999,
            bgcolor: dotColor,
            flexShrink: 0,
          }}
        />
        {label}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'text.primary',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </ButtonBase>
  );
}

export function MenuStats({ stats, activeFilter, onFilterChange }: MenuStatsProps) {
  const labels = menuAvailabilityCopy.stats;

  return (
    <Box
      role="toolbar"
      aria-label="Filter by availability"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        gap: 1.5,
      }}
    >
      <StatCard
        filter="total"
        label={labels.total}
        value={stats.total}
        dotColor={TONE_COLORS.total}
        active={activeFilter === 'total'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="available"
        label={labels.available}
        value={stats.available}
        dotColor={TONE_COLORS.available}
        active={activeFilter === 'available'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="86d"
        label={labels.eightySixed}
        value={stats.eightySixed}
        dotColor={TONE_COLORS.eightySixed}
        active={activeFilter === '86d'}
        onSelect={onFilterChange}
      />
      <StatCard
        filter="hidden"
        label={labels.hidden}
        value={stats.hidden}
        dotColor={TONE_COLORS.hidden}
        active={activeFilter === 'hidden'}
        onSelect={onFilterChange}
      />
    </Box>
  );
}

import { Chip } from '@mui/material';

import type { OrganizationStatus } from '@/types/organization';

const STATUS_COLOR: Record<
  OrganizationStatus,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  active: 'success',
  trial: 'info',
  suspended: 'error',
  expiring: 'warning',
  draft: 'default',
  inactive: 'default',
  cancelled: 'default',
  disabled: 'default',
};

type StatusChipProps = Readonly<{
  status: OrganizationStatus | string;
  label?: string;
}>;

export default function StatusChip({ status, label }: StatusChipProps) {
  const normalized = status.toLowerCase() as OrganizationStatus;
  const color = STATUS_COLOR[normalized] ?? 'default';

  return (
    <Chip
      size="small"
      label={label ?? status}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{ textTransform: 'capitalize' }}
    />
  );
}

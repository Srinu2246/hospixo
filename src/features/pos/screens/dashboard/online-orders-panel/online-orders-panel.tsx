'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { OnlinePlatformStat } from '@/features/pos/config/dashboard';
import { formatInr } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

interface OnlineOrdersPanelProps {
  totalSales: number;
  orders: number;
  platforms: OnlinePlatformStat[];
}

const platformInitials: Record<string, string> = {
  zomato: 'Z',
  swiggy: 'S',
  growthfalcons: 'G',
};

const platformTone: Record<string, string> = {
  zomato: '#E23744',
  swiggy: '#FC8019',
  growthfalcons: '#2563EB',
};

export function OnlineOrdersPanel({
  totalSales,
  orders,
  platforms,
}: Readonly<OnlineOrdersPanelProps>) {
  return (
    <DashboardPanel
      title="Online Orders"
      titleId="online-orders-title"
      headerAction={
        <Tooltip title="Filter window for online channel totals" arrow>
          <Select
            size="small"
            value="today"
            aria-label="Online orders time range"
            sx={{ minWidth: 96 }}
          >
            <MenuItem value="today">Today</MenuItem>
          </Select>
        </Tooltip>
      }
    >
      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total Online Sales
          </Typography>
          <Typography fontWeight={700}>{formatInr(totalSales)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Orders
          </Typography>
          <Typography fontWeight={700}>{orders}</Typography>
        </Box>
      </Stack>

      <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {platforms.map((platform) => (
          <Stack
            key={platform.id}
            component="li"
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                aria-hidden
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  bgcolor: platformTone[platform.id] ?? 'grey.600',
                  fontSize: 14,
                }}
              >
                {platformInitials[platform.id] ?? platform.name[0]}
              </Box>
              <Typography variant="body2">{platform.name}</Typography>
            </Stack>
            <Tooltip title={`${platform.orders} orders on ${platform.name}`} arrow>
              <Typography fontWeight={600}>{platform.orders}</Typography>
            </Tooltip>
          </Stack>
        ))}
      </Stack>
    </DashboardPanel>
  );
}

'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import type { DashboardSummaryCard, DashboardSummaryIcon } from '@/features/pos/config/dashboard';

const iconMap: Record<DashboardSummaryIcon, typeof RestaurantMenuOutlinedIcon> = {
  totalOrders: RestaurantMenuOutlinedIcon,
  ordersReady: RoomServiceOutlinedIcon,
  pendingOrders: AssignmentOutlinedIcon,
  openBills: AccountBalanceWalletOutlinedIcon,
};

const iconTone: Record<DashboardSummaryIcon, { bg: string; color: string }> = {
  totalOrders: { bg: 'rgb(37 99 235 / 0.12)', color: 'var(--pos-primary)' },
  pendingOrders: { bg: 'rgb(245 158 11 / 0.14)', color: 'var(--pos-warning)' },
  ordersReady: { bg: 'rgb(16 185 129 / 0.12)', color: 'var(--pos-success)' },
  openBills: { bg: 'rgb(100 116 139 / 0.12)', color: 'var(--pos-text-muted)' },
};

const iconTooltips: Record<DashboardSummaryIcon, string> = {
  totalOrders: 'Running and ready orders in the store',
  pendingOrders: 'Orders still in kitchen preparation',
  ordersReady: 'Orders marked ready to serve',
  openBills: 'Unpaid or billing-stage orders',
};

interface SummaryCardsProps {
  cards: DashboardSummaryCard[];
}

export function SummaryCards({ cards }: Readonly<SummaryCardsProps>) {
  return (
    <Box component="section" aria-label="Dashboard summary">
      <Grid container spacing={1.5}>
        {cards.map((card) => {
          const Icon = iconMap[card.icon];
          const tone = iconTone[card.icon];
          return (
            <Grid key={card.id} size={{ xs: 6, lg: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  border: '1px solid var(--pos-border)',
                  borderRadius: 'var(--pos-radius-md)',
                  bgcolor: 'var(--pos-surface)',
                  boxShadow: 'var(--pos-shadow-card)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {card.label}
                  </Typography>
                  <Tooltip title={iconTooltips[card.icon]} arrow>
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: tone.bg,
                        color: tone.color,
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                  </Tooltip>
                </Box>
                <Typography sx={{ mt: 1.5, mb: 0.5, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--pos-success)', fontWeight: 500 }}>
                  {card.trend}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

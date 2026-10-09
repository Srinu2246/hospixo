'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { FloorTable, FloorTableStatus } from '@/features/pos/config/dashboard';
import { getFloorStatusLabel } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

const statusDotColor: Record<FloorTableStatus, string> = {
  occupied: 'var(--pos-primary)',
  vacant: 'var(--pos-success)',
  reserved: 'var(--pos-warning)',
  cleaning: 'var(--pos-text-muted)',
};

interface FloorStatusProps {
  tables: FloorTable[];
  legend: { status: FloorTableStatus; label: string }[];
}

export function FloorStatus({ tables, legend }: Readonly<FloorStatusProps>) {
  return (
    <DashboardPanel title="Restaurant Floor Status" titleId="floor-status-title">
      {tables.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
          No tables configured for this outlet.
        </Typography>
      ) : (
        <Grid container spacing={1}>
          {tables.map((table) => (
            <Grid key={table.id} size={{ xs: 4, sm: 4 }}>
              <Tooltip title={`${table.label} — ${getFloorStatusLabel(table.status)}`} arrow>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderColor: 'var(--pos-border)',
                    bgcolor: 'var(--pos-surface-muted, var(--pos-surface))',
                  }}
                >
                  <Typography fontWeight={700}>{table.label}</Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ mt: 0.75, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: statusDotColor[table.status],
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getFloorStatusLabel(table.status)}
                    </Typography>
                  </Stack>
                </Paper>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      )}

      <Stack
        component="ul"
        direction="row"
        useFlexGap
        sx={{
          mt: 2,
          p: 0,
          listStyle: 'none',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
        aria-label="Table status legend"
      >
        {legend.map((item) => (
          <Stack
            key={item.status}
            component="li"
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center' }}
          >
            <Box
              aria-hidden
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: statusDotColor[item.status],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </DashboardPanel>
  );
}

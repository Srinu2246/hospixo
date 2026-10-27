'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { screen } from '@/lib/theme/mui/breakpoints';
import { reservationsOnline, totalSeats } from '@/lib/helpers/floorAndTableSetup';
import type { SavedFloor } from '@/features/management/floor-and-table-setup/types/floorSetup';

export function SuccessStep({
  floor,
  outlet,
  onHub,
  onSetup,
}: Readonly<{
  floor: SavedFloor;
  outlet: string;
  onHub: () => void;
  onSetup: () => void;
}>) {
  const seatCount = totalSeats(floor.tables);
  const rows = [
    { label: 'Floor Name', value: floor.details.name },
    {
      label: 'Seating Summary',
      value: `${floor.tables.length} ${floor.tables.length === 1 ? 'Table' : 'Tables'} - ${seatCount} ${seatCount === 1 ? 'Seat' : 'Seats'}`,
    },
    {
      label: 'Reservations',
      value: reservationsOnline(floor.tables) ? 'Online Active' : 'Offline',
      accent: reservationsOnline(floor.tables),
    },
  ];

  return (
    <Stack sx={{ alignItems: 'center', py: { [screen.mobile]: 2, [screen.desktop]: 6 } }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 640,
          bgcolor: 'background.paper',
          borderRadius: { [screen.mobile]: '16px', [screen.desktop]: '20px' },
          border: '1px solid',
          borderColor: 'divider',
          p: { [screen.mobile]: 2.5, [screen.desktop]: 4 },
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(16, 185, 129, 0.15)',
            color: 'success.main',
          }}
        >
          <Check size={28} strokeWidth={3} />
        </Box>
        <Typography
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { [screen.mobile]: '1.25rem', [screen.desktop]: '1.5rem' },
            mt: 2,
          }}
        >
          Floor Created Successfully!
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.6 }}>
          The {floor.details.name} has been configured and is now active for {outlet}.
        </Typography>
        <Stack
          spacing={1.25}
          sx={{
            mt: 3,
            p: 2,
            textAlign: 'left',
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          {rows.map((row) => (
            <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography
                sx={{ color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.04em' }}
              >
                {row.label.toUpperCase()}
              </Typography>
              <Typography
                sx={{ fontWeight: 800, color: row.accent ? 'success.main' : 'text.primary' }}
              >
                {row.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack
          direction={{ [screen.mobile]: 'column', [screen.tablet]: 'row' }}
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <ActionButton variant="outlined" fullWidth onClick={onHub}>
            Back to Setup Hub
          </ActionButton>
          <ActionButton fullWidth onClick={onSetup}>
            Go to Floor Set-up
          </ActionButton>
        </Stack>
      </Box>
    </Stack>
  );
}

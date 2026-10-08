import type { Metadata } from 'next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { KitchenDisplayConnected } from '@/features/kitchen/components/kitchen-display-connected';

export const metadata: Metadata = { title: 'Kitchen Display' };

export default function KitchenPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Kitchen Display
      </Typography>
      <KitchenDisplayConnected title="Kitchen Display" />
    </Box>
  );
}

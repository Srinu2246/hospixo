'use client';

import { ArrowLeft } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config/copy';
import { FloorFormDialog } from '@/features/floor-table-setup/components/floor-form-dialog';
import { useFloorTableMutations } from '@/features/floor-table-setup/hooks/use-floor-table-setup';
import type { CreateFloorFormValues } from '@/features/floor-table-setup/schemas/floor-table';

export function FloorCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? null;
  const mutations = useFloorTableMutations(branchId);
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: CreateFloorFormValues) {
    setError(null);
    try {
      await mutations.createFloor.mutateAsync(values);
      router.push(routes.dashboard.floors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create floor.');
    }
  }

  if (!branchId) {
    return (
      <Box sx={{ p: { xs: 2, md: 2.5 }, maxWidth: 640, mx: 'auto' }}>
        <Alert severity="warning">{floorTableSetupCopy.branchRequired}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, maxWidth: 640, mx: 'auto', width: '100%' }}>
      <Stack spacing={2.5}>
        <Button
          component={Link}
          href={routes.dashboard.floors}
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to floors
        </Button>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            {floorTableSetupCopy.createTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {floorTableSetupCopy.createSubtitle}
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </Paper>
      </Stack>

      <FloorFormDialog
        open={open}
        mode="create"
        isPending={mutations.createFloor.isPending}
        onClose={() => {
          setOpen(false);
          router.push(routes.dashboard.floors);
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

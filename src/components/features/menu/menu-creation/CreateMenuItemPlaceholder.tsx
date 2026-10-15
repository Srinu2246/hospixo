'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

export interface CreateMenuItemPlaceholderProps {
  mode: 'create' | 'edit';
  item?: MenuCatalogItem | null;
  onBack: () => void;
}

export function CreateMenuItemPlaceholder({
  mode,
  item,
  onBack,
}: Readonly<CreateMenuItemPlaceholderProps>) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <ActionButton
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to list
        </ActionButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {mode === 'edit' ? `Edit item${item ? `: ${item.name}` : ''}` : 'Add menu item'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Full item form (pricing, variants, modifiers, images) will plug in here next. The layout
          and navigation flow are ready.
        </Typography>
      </Stack>
    </Paper>
  );
}

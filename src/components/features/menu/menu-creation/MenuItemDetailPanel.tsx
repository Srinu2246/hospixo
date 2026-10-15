'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft, Pencil } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

export interface MenuItemDetailPanelProps {
  item: MenuCatalogItem;
  onBack: () => void;
  onEdit: () => void;
}

export function MenuItemDetailPanel({ item, onBack, onEdit }: Readonly<MenuItemDetailPanelProps>) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <ActionButton variant="text" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
            Back to list
          </ActionButton>
          <ActionButton variant="outlined" startIcon={<Pencil size={16} />} onClick={onEdit}>
            Edit item
          </ActionButton>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          sx={{ alignItems: 'flex-start' }}
        >
          <Avatar
            src={item.imageUrl}
            alt=""
            variant="rounded"
            sx={{ width: 120, height: 120, bgcolor: 'action.hover' }}
          >
            {item.name.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {item.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              <StatusChip label={item.dietary} size="small" />
              <StatusChip label={item.status} size="small" />
              <StatusChip label={item.categoryName} variantType="info" size="small" />
              {item.tags.map((tag) => (
                <StatusChip key={tag} label={tag} variantType="info" size="small" />
              ))}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              ₹{item.basePrice.toLocaleString('en-IN')}
            </Typography>
            {item.description ? (
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No description yet.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Order types: {item.orderTypes.join(' · ') || '—'}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}

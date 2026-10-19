'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AlertTriangle, Info } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

export interface DeleteMenuItemModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  item: MenuCatalogItem | null;
  /** Disables actions while deactivate request is in flight. */
  loading?: boolean;
}

/**
 * Delete Menu Item Confirmation Modal
 *
 * Implements the delete confirmation dialog (Image 2) with:
 * - Centered light-red circular badge with warning triangle
 * - Centered bold title & detailed confirmation message
 * - Notice banner if item is marked as Inactive
 * - Cancel and solid-red Delete Item action buttons
 * - Pixel-perfect padding and typography matching reference design
 */
export function DeleteMenuItemModal({
  open,
  onClose,
  onConfirm,
  item,
  loading = false,
}: Readonly<DeleteMenuItemModalProps>) {
  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      showCloseButton={false}
      width={450}
      height="auto"
      padding="32px 32px 28px 32px"
      gap={0}
      footer={
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'center', width: '100%', pt: 0.5 }}
        >
          <ActionButton
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              minWidth: 104,
              height: 40,
              borderRadius: '8px',
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={() => {
              void onConfirm();
            }}
            loading={loading}
            disabled={loading}
            sx={{
              minWidth: 124,
              height: 40,
              borderRadius: '8px',
              bgcolor: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: '#DC2626',
              },
            }}
          >
            Delete Item
          </ActionButton>
        </Stack>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 0.5,
        }}
      >
        {/* Warning Icon inside Light Red Circle */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <AlertTriangle size={24} color="#EF4444" strokeWidth={2.2} />
        </Box>

        {/* Modal Title */}
        <Typography
          component="h2"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          Delete Menu Item
        </Typography>

        {/* Confirmation Message */}
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            lineHeight: 1.55,
            maxWidth: 370,
            mx: 'auto',
          }}
        >
          Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>? This action
          cannot be undone. All associated size options, add-ons, and scheduling data will be
          permanently removed.
        </Typography>

        {/* Inactive Notice Banner matching reference design */}
        {item.status === 'Inactive' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1,
              borderRadius: '8px',
              bgcolor: '#F1F5F9',
              border: '1px solid',
              borderColor: '#E2E8F0',
              mt: 2,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Info size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <Typography
              sx={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500, textAlign: 'left' }}
            >
              This item is currently marked as Inactive.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

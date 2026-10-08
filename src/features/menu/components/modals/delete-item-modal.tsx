'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { useMenu } from '../../context/menu-context';
import type { MenuItem } from '../../types/menu';

type DeleteItemModalProps = {
  item: MenuItem | null;
  onClose: () => void;
};

export function DeleteItemModal({ item, onClose }: DeleteItemModalProps) {
  const { deleteMenuItem } = useMenu();

  if (!item) return null;

  async function handleDelete() {
    if (!item) return;
    const result = await deleteMenuItem(item.id);
    if (result.ok) {
      onClose();
    }
  }

  return (
    <Dialog
      open={Boolean(item)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { p: 1 },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <DeleteOutlinedIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, m: 0 }}>
          Delete {item.name}?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to remove <strong>{item.name}</strong> from the menu? This dish will
          no longer be available for ordering across POS, Dine-In, and online channels.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleDelete}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Yes, Delete Item
        </Button>
      </DialogActions>
    </Dialog>
  );
}

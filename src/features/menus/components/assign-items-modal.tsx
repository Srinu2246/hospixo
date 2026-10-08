'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';

import { menusCopy } from '../config/copy';
import { useMenus } from '../context/menus-context';
import type { MenuSession } from '../types/menus';
import { AssignItemsModalSkeleton } from './skeleton/menus-skeletons';

type AssignItemsModalProps = Readonly<{
  session: MenuSession;
  open: boolean;
  onClose: () => void;
  onAssign: (
    categoryIds: string[],
  ) => Promise<{ ok: true; data?: undefined } | { ok: false; message: string }>;
}>;

export function AssignItemsModal({ session, open, onClose, onAssign }: AssignItemsModalProps) {
  const { categories, items, ensureCategories, ensureItems } = useMenus();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedCategoryIds([]);
    setPending(false);
    setAssignError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void ensureCategories().then(() => {
      if (!cancelled) setCategoriesLoaded(true);
    });
    void ensureItems();
    return () => {
      cancelled = true;
    };
  }, [ensureCategories, ensureItems, open]);

  const categoriesReady = categories.length > 0 || categoriesLoaded;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const resolvedCategoryIds = useMemo(() => {
    if (selectedCategoryIds.includes('all')) return categories.map((category) => category.id);
    return selectedCategoryIds;
  }, [categories, selectedCategoryIds]);

  const selectedItemCount = useMemo(() => {
    if (selectedCategoryIds.includes('all')) return items.length;
    return items.filter((item) => selectedCategoryIds.includes(item.categoryId)).length;
  }, [items, selectedCategoryIds]);

  function toggleCategory(categoryId: string) {
    setAssignError(null);
    setSelectedCategoryIds((current) => {
      if (categoryId === 'all') {
        return current.includes('all') ? [] : ['all'];
      }
      const withoutAll = current.filter((id) => id !== 'all');
      return withoutAll.includes(categoryId)
        ? withoutAll.filter((id) => id !== categoryId)
        : [...withoutAll, categoryId];
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {menusCopy.assignTitlePrefix} {session.name}
        </Typography>
        <IconButton aria-label="close" onClick={handleClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {!categoriesReady ? (
          <AssignItemsModalSkeleton />
        ) : (
          <>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', fontWeight: 600, mb: 1.5 }}
            >
              {menusCopy.categories}
            </Typography>

            <List
              disablePadding
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
            >
              <ListItemButton
                dense
                onClick={() => toggleCategory('all')}
                selected={selectedCategoryIds.includes('all')}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={selectedCategoryIds.includes('all')}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={menusCopy.allCategories}
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } } }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {items.length}
                </Typography>
              </ListItemButton>

              {categories.map((cat, idx) => {
                const selected =
                  selectedCategoryIds.includes('all') || selectedCategoryIds.includes(cat.id);
                return (
                  <ListItemButton
                    key={cat.id}
                    dense
                    onClick={() => toggleCategory(cat.id)}
                    selected={selected}
                    sx={{
                      borderBottom: idx === categories.length - 1 ? 'none' : '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox edge="start" checked={selected} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={cat.name}
                      slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {counts.get(cat.id) ?? 0}
                    </Typography>
                  </ListItemButton>
                );
              })}
            </List>

            {assignError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {assignError}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {menusCopy.itemsSelected(selectedItemCount)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={handleClose} disabled={pending}>
            {menusCopy.cancel}
          </Button>
          <Button
            variant="contained"
            disabled={resolvedCategoryIds.length === 0 || pending}
            onClick={() => {
              setPending(true);
              void onAssign(resolvedCategoryIds).then((result) => {
                setPending(false);
                if (!result.ok) {
                  setAssignError(result.message);
                  return;
                }
                onClose();
                setSelectedCategoryIds([]);
              });
            }}
          >
            {pending ? menusCopy.saving : menusCopy.assignSelected}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import type { MenuSessionAssignedItem } from '@/lib/mocks/menu/useMenuSessionDetail.mocks';
import { colors } from '@/lib/theme/mui/colors';

export type AssignMenuCategoryOption = {
  id: number;
  label: string;
  count: number;
};

export interface AssignMenuItemsModalProps {
  open: boolean;
  sessionName: string;
  categories: readonly AssignMenuCategoryOption[];
  /** Full catalog available to assign. */
  catalogItems: readonly MenuSessionAssignedItem[];
  /** Already assigned item ids. */
  assignedIds: readonly number[];
  onClose: () => void;
  onAssign: (itemIds: number[]) => void;
}

/**
 * Category-only assign modal (matches design): All Categories + per-category rows.
 * Assign Selected adds every unassigned item in the checked categories.
 */
export function AssignMenuItemsModal({
  open,
  sessionName,
  categories,
  catalogItems,
  assignedIds,
  onClose,
  onAssign,
}: Readonly<AssignMenuItemsModalProps>) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const assignedSet = useMemo(() => new Set(assignedIds), [assignedIds]);

  const availableCount = useMemo(
    () => catalogItems.filter((item) => !assignedSet.has(item.id)).length,
    [assignedSet, catalogItems],
  );

  const categoryIds = useMemo(() => categories.map((category) => category.id), [categories]);

  const allSelected =
    categoryIds.length > 0 && categoryIds.every((id) => selectedCategoryIds.includes(id));
  const someSelected = selectedCategoryIds.length > 0 && !allSelected;

  const selectedItemCount = useMemo(() => {
    if (selectedCategoryIds.length === 0) return 0;
    const selected = new Set(selectedCategoryIds);
    return catalogItems.filter((item) => selected.has(item.categoryId) && !assignedSet.has(item.id))
      .length;
  }, [assignedSet, catalogItems, selectedCategoryIds]);

  function toggleAll() {
    setSelectedCategoryIds((prev) =>
      categoryIds.length > 0 && categoryIds.every((id) => prev.includes(id))
        ? []
        : [...categoryIds],
    );
  }

  function toggleCategory(categoryId: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  }

  function handleClose() {
    setSelectedCategoryIds([]);
    onClose();
  }

  function handleAssign() {
    if (selectedCategoryIds.length === 0) return;
    const selected = new Set(selectedCategoryIds);
    const itemIds = catalogItems
      .filter((item) => selected.has(item.categoryId) && !assignedSet.has(item.id))
      .map((item) => item.id);
    if (itemIds.length === 0) return;
    onAssign(itemIds);
    handleClose();
  }

  const rows: Array<{ id: number | 'all'; label: string; count: number }> = [
    { id: 'all', label: 'All Categories', count: availableCount },
    ...categories,
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Assign Menu Items to ${sessionName}`}
      width={520}
      height={640}
      padding={24}
      gap={20}
      footer={
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {selectedItemCount} item{selectedItemCount === 1 ? '' : 's'} selected
          </Typography>
          <Stack direction="row" spacing={1.25}>
            <ActionButton variant="outlined" onClick={handleClose}>
              Cancel
            </ActionButton>
            <ActionButton onClick={handleAssign} disabled={selectedItemCount === 0}>
              Assign Selected
            </ActionButton>
          </Stack>
        </Stack>
      }
    >
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          bgcolor: 'background.paper',
          p: 2,
          overflow: 'auto',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            mb: 1.5,
            px: 0.5,
          }}
        >
          Categories
        </Typography>

        {availableCount === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 0.5, py: 2 }}>
            Every catalog item is already assigned to this session.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {rows.map((row) => {
              const isAll = row.id === 'all';
              const selected = isAll ? allSelected : selectedCategoryIds.includes(row.id as number);
              const indeterminate = isAll ? someSelected : false;

              return (
                <Box
                  key={String(row.id)}
                  component="button"
                  type="button"
                  onClick={() => (isAll ? toggleAll() : toggleCategory(row.id as number))}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid',
                    borderColor: selected ? colors.primary.default : 'transparent',
                    borderRadius: '10px',
                    px: 1.25,
                    py: 1.1,
                    cursor: 'pointer',
                    bgcolor: selected ? 'rgba(51, 84, 244, 0.08)' : 'transparent',
                    color: 'text.primary',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    '&:hover': {
                      bgcolor: selected ? 'rgba(51, 84, 244, 0.12)' : 'action.hover',
                    },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={selected}
                    indeterminate={indeterminate}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      p: 0.25,
                      color: 'text.secondary',
                      '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                        color: colors.primary.default,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontWeight: selected ? 600 : 500,
                      fontSize: '0.9375rem',
                      minWidth: 0,
                    }}
                    noWrap
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      flexShrink: 0,
                      minWidth: 28,
                      textAlign: 'right',
                    }}
                  >
                    {row.count}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Modal>
  );
}

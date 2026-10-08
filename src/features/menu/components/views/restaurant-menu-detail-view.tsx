'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowLeft, Edit2, Plus, Trash2 } from 'lucide-react';

import { useRestaurantMenus } from '../../context/restaurant-menus-context';
import type { MenuTreeCategory } from '../../types/restaurant-menu';

function TreeCategoryNode({ category, depth = 0 }: { category: MenuTreeCategory; depth?: number }) {
  return (
    <Box sx={{ ml: depth > 0 ? depth * 1.5 : 0, mb: 1 }}>
      <Box sx={{ py: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {category.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Category #{category.categoryId}
          {category.displayOrder != null ? ` · Order ${category.displayOrder}` : ''}
        </Typography>
      </Box>
      {category.items.length > 0 ? (
        <Stack spacing={0.5} sx={{ pl: 2, mb: 1 }}>
          {category.items.map((item) => (
            <Box key={item.id} sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.code ? `${item.code} · ` : ''}
                {item.basePrice != null ? `₹${item.basePrice}` : 'No price'}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : null}
      {category.children.map((child) => (
        <TreeCategoryNode
          key={`${child.categoryId}-${child.assignmentId ?? 'child'}`}
          category={child}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
}

export function RestaurantMenuDetailView() {
  const {
    selectedMenu,
    categoryAssignments,
    menuTree,
    serverDetailHydrated,
    detailLoading,
    detailError,
    categoriesLoading,
    availableCategoriesForAssignment,
    backToList,
    openEditMenuPage,
    loadMenuDetail,
    assignCategory,
    removeCategoryAssignment,
  } = useRestaurantMenus();

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!selectedMenu || serverDetailHydrated) return;
    void loadMenuDetail(selectedMenu.id);
  }, [loadMenuDetail, selectedMenu, serverDetailHydrated]);

  if (!selectedMenu) return null;

  async function handleAssignCategory() {
    if (!selectedCategoryId) {
      setAssignError('Select a category to assign.');
      return;
    }

    setIsAssigning(true);
    setAssignError(null);
    const result = await assignCategory(selectedMenu!.id, selectedCategoryId);
    setIsAssigning(false);

    if (!result.ok) {
      setAssignError(result.message ?? 'Failed to assign category.');
      return;
    }

    setSelectedCategoryId('');
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'flex-start' },
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={backToList}
            sx={{ textTransform: 'none', flexShrink: 0 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {selectedMenu.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedMenu.description || 'No description provided.'}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip size="small" label={selectedMenu.code} variant="outlined" />
              <Chip size="small" label={selectedMenu.menuType} variant="outlined" />
              <Chip size="small" label={selectedMenu.status} variant="outlined" />
            </Stack>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<Edit2 size={14} />}
          onClick={() => openEditMenuPage(selectedMenu)}
          sx={{ textTransform: 'none', alignSelf: { xs: 'flex-start', md: 'center' } }}
        >
          Edit Menu
        </Button>
      </Stack>

      {detailError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailError}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Category Assignments
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  if (assignError) setAssignError(null);
                }}
                disabled={categoriesLoading || isAssigning}
              >
                <MenuItem value="">Select category</MenuItem>
                {availableCategoriesForAssignment.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Plus size={14} />}
              onClick={() => void handleAssignCategory()}
              disabled={
                categoriesLoading || isAssigning || availableCategoriesForAssignment.length === 0
              }
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Assign
            </Button>
          </Stack>

          {assignError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignError}
            </Alert>
          ) : null}

          {detailLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading assignments…
            </Typography>
          ) : categoryAssignments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No categories assigned to this menu yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {categoryAssignments.map((assignment) => (
                <Box
                  key={assignment.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assignment.categoryName ?? `Category ${assignment.categoryId}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Order {assignment.displayOrder}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={12} />}
                    onClick={() => void removeCategoryAssignment(selectedMenu.id, assignment.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Menu Tree
          </Typography>
          {detailLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading menu tree…
            </Typography>
          ) : !menuTree || menuTree.categories.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Menu tree is empty. Assign categories to build the tree.
            </Typography>
          ) : (
            <Box>
              {menuTree.categories.map((category) => (
                <TreeCategoryNode
                  key={`${category.categoryId}-${category.assignmentId ?? 'root'}`}
                  category={category}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

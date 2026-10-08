'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Pagination from '@mui/material/Pagination';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

import { useMenu } from '../../context/menu-context';
import type { MenuItem } from '../../types/menu';
import { MenuItemsTableSkeleton } from '../skeleton/menu-items-table-skeleton';

export function MenuItemsTable() {
  const {
    pageConfig,
    categories,
    paginatedItems,
    filteredItems,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    openEditItemPage,
    openViewItemPage,
    openDeleteModal,
    openCreateItemPage,
    openCreateCategoryPage,
    itemsLoading,
    itemsError,
    categoriesLoading,
    categoriesError,
  } = useMenu();

  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const totalCount = filteredItems.length;
  const startCount = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, totalCount);

  function formatOrderTypes(types?: string[]) {
    if (!types || types.length === 0) return 'D|T|D';
    const map: Record<string, string> = {
      'Dine In': 'D',
      'Take Away': 'T',
      Delivery: 'D',
      'Dine-In': 'D',
      Takeaway: 'T',
    };
    return types.map((t) => map[t] || t.charAt(0)).join('|');
  }

  function getDietaryBadge(dietary: MenuItem['dietary']) {
    if (dietary === 'Veg') {
      return (
        <Chip
          label="Veg"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: 'rgba(46, 125, 50, 0.08)',
            color: 'success.main',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        />
      );
    }
    if (dietary === 'Non-Veg') {
      return (
        <Chip
          label="Non-Veg"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: 'rgba(211, 47, 47, 0.08)',
            color: 'error.main',
            border: '1px solid',
            borderColor: 'error.light',
          }}
        />
      );
    }
    return (
      <Chip
        label={dietary}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.75rem',
          fontWeight: 600,
          bgcolor: 'action.focus',
          color: 'text.secondary',
        }}
      />
    );
  }

  if (categoriesLoading || itemsLoading) {
    return <MenuItemsTableSkeleton />;
  }

  if (itemsError) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Could not load menu items
        </Typography>
        <Typography variant="body2" color="error" role="alert">
          {itemsError}
        </Typography>
      </Paper>
    );
  }

  if (categories.length === 0) {
    const canManageCategories = pageConfig?.canManageCategories ?? false;

    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: 'text.secondary',
          }}
        >
          <GridViewIcon fontSize="large" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No Categories Yet
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 440, mb: 3 }}
          role={categoriesError || itemsError ? 'alert' : undefined}
        >
          {categoriesError ??
            itemsError ??
            (canManageCategories
              ? 'Create your first category to start organizing your menu items. Categorized menus make ordering easier for customers and staff.'
              : 'This branch menu is empty. Set up categories and items in company Menu Creation, then reload this page.')}
        </Typography>
        {canManageCategories && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateCategoryPage}>
            Add category
          </Button>
        )}
      </Paper>
    );
  }

  if (totalCount === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: 'text.secondary',
          }}
        >
          <AssignmentOutlinedIcon fontSize="large" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No menu items yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start building your menu by adding your first item
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateItemPage}>
          Add Item
        </Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600, width: 64 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Base Price
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dietary</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Order Types
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, width: 100 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => {
              const hasImage = Boolean(item.image && !imageLoadErrors[item.id]);
              const isHidden = item.status === 'Hidden';

              return (
                <TableRow
                  key={item.id}
                  hover
                  onClick={() => openViewItemPage(item)}
                  sx={{
                    cursor: 'pointer',
                    opacity: isHidden ? 0.65 : 1,
                    transition: 'background-color 0.2s',
                  }}
                >
                  {/* Image */}
                  <TableCell>
                    {hasImage ? (
                      <Avatar
                        src={item.image}
                        alt={item.name}
                        variant="rounded"
                        sx={{ width: 42, height: 42, borderRadius: 1 }}
                        slotProps={{
                          img: {
                            onError: () =>
                              setImageLoadErrors((prev) => ({ ...prev, [item.id]: true })),
                          },
                        }}
                      />
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1,
                          bgcolor: 'action.focus',
                          color: 'text.secondary',
                        }}
                      >
                        <ImageOutlinedIcon fontSize="small" />
                      </Avatar>
                    )}
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {item.name}
                    </Typography>
                  </TableCell>

                  {/* Scope */}
                  <TableCell>
                    <Chip
                      label={
                        item.scope === 'branch'
                          ? (item.assignBranchName ?? `Outlet ${item.assignBranchId ?? '—'}`)
                          : 'All outlets'
                      }
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        bgcolor: item.scope === 'branch' ? 'primary.lighter' : 'action.hover',
                        color: item.scope === 'branch' ? 'primary.main' : 'text.secondary',
                      }}
                    />
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Chip
                      label={item.categoryName}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </TableCell>

                  {/* Base Price */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      ₹{item.basePrice}
                    </Typography>
                  </TableCell>

                  {/* Dietary */}
                  <TableCell>{getDietaryBadge(item.dietary)}</TableCell>

                  {/* Order Types */}
                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {formatOrderTypes(item.orderTypes)}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={isHidden ? 'Hidden' : 'Available'}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: isHidden ? 'action.focus' : 'rgba(46, 125, 50, 0.08)',
                        color: isHidden ? 'text.secondary' : 'success.main',
                      }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => openEditItemPage(item)}
                        aria-label={`Edit ${item.name}`}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteModal(item)}
                        aria-label={`Delete ${item.name}`}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1.5,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing{' '}
          <strong>
            {startCount}–{endCount}
          </strong>{' '}
          of <strong>{totalCount}</strong> items
        </Typography>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
        />
      </Box>
    </Paper>
  );
}

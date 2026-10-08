'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Edit2, Eye, Power, PowerOff } from 'lucide-react';

import { useRestaurantMenus } from '../../context/restaurant-menus-context';
import type { RestaurantMenu } from '../../types/restaurant-menu';
import { RestaurantMenusTableSkeleton } from '../skeleton/restaurant-menus-table-skeleton';

export function RestaurantMenusTable() {
  const {
    menus,
    menusLoading,
    menusError,
    openViewMenuPage,
    openEditMenuPage,
    activateMenu,
    deactivateMenu,
  } = useRestaurantMenus();

  async function handleToggleStatus(menu: RestaurantMenu) {
    if (menu.status === 'Active') {
      await deactivateMenu(menu.id);
    } else {
      await activateMenu(menu.id);
    }
  }

  if (menusLoading) {
    return <RestaurantMenusTableSkeleton />;
  }

  if (menusError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 1 }}>
        {menusError}
      </Alert>
    );
  }

  if (menus.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No menus yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first menu to organize categories and items for different channels.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Order</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {menus.map((menu) => (
            <TableRow key={menu.id} hover>
              <TableCell>{menu.name}</TableCell>
              <TableCell>{menu.code}</TableCell>
              <TableCell>{menu.menuType}</TableCell>
              <TableCell align="right">{menu.displayOrder}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={menu.status}
                  color={menu.status === 'Active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Eye size={14} />}
                    onClick={() => openViewMenuPage(menu)}
                    sx={{ textTransform: 'none' }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit2 size={14} />}
                    onClick={() => openEditMenuPage(menu)}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color={menu.status === 'Active' ? 'error' : 'primary'}
                    startIcon={
                      menu.status === 'Active' ? <PowerOff size={14} /> : <Power size={14} />
                    }
                    onClick={() => void handleToggleStatus(menu)}
                    sx={{ textTransform: 'none' }}
                  >
                    {menu.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

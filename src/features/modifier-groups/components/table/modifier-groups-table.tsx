'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Eye, Pencil } from 'lucide-react';

import { useModifierGroups } from '../../context/modifier-groups-context';

export function ModifierGroupsTable() {
  const { groups, groupsLoading, groupsError, openViewGroupPage, openEditGroupPage } =
    useModifierGroups();

  if (groupsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (groupsError) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">{groupsError}</Alert>
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          No modifier groups yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create groups like &quot;Spice Level&quot;, &quot;Extra Toppings&quot;, or
          &quot;Sides&quot;.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'hidden' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Group Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Min Select</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Max Select</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Requirement</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => {
            const isActive = (group.status ?? 'active').toLowerCase() === 'active';
            return (
              <TableRow key={group.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{group.name}</TableCell>
                <TableCell>{group.minSelect}</TableCell>
                <TableCell>{group.maxSelect}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={group.isRequired ? 'Required' : 'Optional'}
                    color={group.isRequired ? 'primary' : 'default'}
                    variant={group.isRequired ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={isActive ? 'Active' : 'Inactive'}
                    color={isActive ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={14} />}
                      onClick={() => openViewGroupPage(group)}
                      sx={{ textTransform: 'none' }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={14} />}
                      onClick={() => openEditGroupPage(group)}
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

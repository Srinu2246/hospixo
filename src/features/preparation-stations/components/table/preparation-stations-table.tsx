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

import { usePreparationStations } from '../../context/preparation-stations-context';

export function PreparationStationsTable() {
  const { stations, stationsLoading, stationsError, openViewStationPage, openEditStationPage } =
    usePreparationStations();

  if (stationsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (stationsError) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">{stationsError}</Alert>
      </Box>
    );
  }

  if (stations.length === 0) {
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
          No preparation stations yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create stations like &quot;Main Kitchen&quot;, &quot;Bar&quot;, &quot;Grill&quot;, or
          &quot;Dessert Station&quot;.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'hidden' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Station Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Station Code</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.map((station) => {
            const isActive = (station.status ?? 'active').toLowerCase() === 'active';
            return (
              <TableRow key={station.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{station.name}</TableCell>
                <TableCell>{station.code}</TableCell>
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
                      onClick={() => openViewStationPage(station)}
                      sx={{ textTransform: 'none' }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={14} />}
                      onClick={() => openEditStationPage(station)}
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

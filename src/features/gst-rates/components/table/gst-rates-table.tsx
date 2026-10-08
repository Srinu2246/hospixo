'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Eye } from 'lucide-react';

import { useGstRates } from '../../context/gst-rates-context';

export function GstRatesTable() {
  const { rates, ratesLoading, ratesError, openViewRatePage } = useGstRates();

  if (ratesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (ratesError) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">{ratesError}</Alert>
      </Box>
    );
  }

  if (rates.length === 0) {
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
          No GST rates yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first GST slab to use across menu items.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>GST Code</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Slab Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>CGST</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>SGST</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>IGST</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Effective From</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{rate.code}</TableCell>
              <TableCell>{rate.name}</TableCell>
              <TableCell>{rate.cgstRate}%</TableCell>
              <TableCell>{rate.sgstRate}%</TableCell>
              <TableCell>{rate.igstRate}%</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{rate.totalRate}%</TableCell>
              <TableCell>{new Date(rate.effectiveFrom).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Eye size={14} />}
                  onClick={() => openViewRatePage(rate)}
                  sx={{ textTransform: 'none' }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

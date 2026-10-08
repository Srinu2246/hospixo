'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Plus } from 'lucide-react';

import { useModifierGroups } from '../../context/modifier-groups-context';
import type { ModifierGroupStatus } from '../../types/modifier-group-api';

type ModifierOptionsPanelProps = Readonly<{
  groupId: string;
}>;

export function ModifierOptionsPanel({ groupId }: ModifierOptionsPanelProps) {
  const { options, optionsLoading, optionsError, loadGroupOptions, createOption, updateOption } =
    useModifierGroups();

  const [name, setName] = useState('');
  const [priceDelta, setPriceDelta] = useState('0');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void loadGroupOptions(groupId);
  }, [groupId, loadGroupOptions]);

  async function handleCreateOption(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Option name is required.');
      return;
    }

    const price = Number(priceDelta);
    const order = Number(displayOrder);
    if (Number.isNaN(price) || Number.isNaN(order) || order < 0) {
      setFormError('Enter a valid price and display order.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const result = await createOption(groupId, {
      name: name.trim(),
      priceDelta: price,
      displayOrder: order,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message ?? 'Failed to create option.');
      return;
    }

    setName('');
    setPriceDelta('0');
    setDisplayOrder(String(options.length + 1));
  }

  async function toggleOptionStatus(optionId: string, currentStatus?: string) {
    const nextStatus: ModifierGroupStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    await updateOption(groupId, optionId, { status: nextStatus });
  }

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Modifier Options
        </Typography>

        {optionsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {optionsError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleCreateOption} sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5 }}>
            Add New Option
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <TextField
              label="Option Name *"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              sx={{ flex: 2 }}
            />
            <TextField
              label="Price Delta (₹)"
              type="number"
              size="small"
              value={priceDelta}
              onChange={(e) => setPriceDelta(e.target.value)}
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Display Order"
              type="number"
              size="small"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Plus size={16} />}
              disabled={isSubmitting}
              sx={{ height: 40, textTransform: 'none', px: 3 }}
            >
              Add
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {(() => {
          if (optionsLoading) {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            );
          }
          if (options.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No options defined for this modifier group yet.
              </Typography>
            );
          }
          return (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Option Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price Delta</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {options.map((option) => {
                    const isActive = (option.status ?? 'active').toLowerCase() === 'active';
                    return (
                      <TableRow key={option.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{option.name}</TableCell>
                        <TableCell>+₹{option.priceDelta}</TableCell>
                        <TableCell>{option.displayOrder}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isActive ? 'Active' : 'Inactive'}
                            color={isActive ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="text"
                            color={isActive ? 'error' : 'primary'}
                            onClick={() => toggleOptionStatus(option.id, option.status)}
                            sx={{ textTransform: 'none' }}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}
      </CardContent>
    </Card>
  );
}

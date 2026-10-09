'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CrudDetailHeader } from '@/components/ui/crud-detail-header';
import { CrudFormActions } from '@/components/ui/crud-form-actions';
import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { useModifierGroups } from '../../context/modifier-groups-context';
import type { ModifierGroupStatus } from '../../types/modifier-group-api';
import { ModifierOptionsPanel } from '../options/modifier-options-panel';

export function ModifierGroupForm({ mode }: { readonly mode: 'create' | 'edit' }) {
  const { selectedGroup, createGroup, updateGroup, backToList } = useModifierGroups();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(isEdit ? (selectedGroup?.name ?? '') : '');
  const [minSelect, setMinSelect] = useState(isEdit ? String(selectedGroup?.minSelect ?? 0) : '0');
  const [maxSelect, setMaxSelect] = useState(isEdit ? String(selectedGroup?.maxSelect ?? 1) : '1');
  const [isRequired, setIsRequired] = useState(
    isEdit ? (selectedGroup?.isRequired ?? false) : false,
  );
  const [status, setStatus] = useState<ModifierGroupStatus>(
    (selectedGroup?.status as ModifierGroupStatus) ?? 'active',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEdit && !selectedGroup) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    const min = Math.max(0, parseInt(minSelect, 10) || 0);
    const max = Math.max(min, parseInt(maxSelect, 10) || 1);

    setIsSubmitting(true);
    setError(null);

    const result = isEdit
      ? await updateGroup(selectedGroup!.id, {
          name: name.trim(),
          minSelect: min,
          maxSelect: max,
          isRequired,
          status,
        })
      : await createGroup({
          name: name.trim(),
          minSelect: min,
          maxSelect: max,
          isRequired,
        });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(
        result.message ??
          (isEdit ? 'Failed to update modifier group.' : 'Failed to create modifier group.'),
      );
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/company' },
    { label: 'Modifier Groups', onClick: backToList },
    {
      label: isEdit ? `Edit ${selectedGroup?.name ?? ''}` : 'Create Modifier Group',
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar items={breadcrumbs} />

      <CrudDetailHeader
        title={isEdit ? 'Edit Modifier Group' : 'Create Modifier Group'}
        subtitle={
          isEdit
            ? `Update group settings for ${selectedGroup?.name ?? ''}`
            : 'Configure addon or choice groups that can be attached to items.'
        }
        onBack={backToList}
      />

      <Card variant="outlined" sx={{ borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            Group Information
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: isEdit ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="groupName"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Group Name
                </Typography>
                <TextField
                  id="groupName"
                  placeholder="e.g. Choose Crust, Extra Toppings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="minSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Min Selection
                </Typography>
                <TextField
                  id="minSelect"
                  type="number"
                  value={minSelect}
                  onChange={(e) => setMinSelect(e.target.value)}
                  disabled={isSubmitting}
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="maxSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Max Selection
                </Typography>
                <TextField
                  id="maxSelect"
                  type="number"
                  value={maxSelect}
                  onChange={(e) => setMaxSelect(e.target.value)}
                  disabled={isSubmitting}
                  slotProps={{ htmlInput: { min: 1 } }}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              {isEdit && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component="label"
                    htmlFor="groupStatus"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 0.5,
                    }}
                  >
                    Status
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      id="groupStatus"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ModifierGroupStatus)}
                      disabled={isSubmitting}
                      sx={{ height: 40, borderRadius: '8px' }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Customer must make a selection (Required)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check if ordering requires picking at least one option from this group.
                  </Typography>
                </Box>
              }
            />

            <CrudFormActions
              onCancel={backToList}
              submitLabel={isEdit ? 'Save Changes' : 'Create Modifier Group'}
              isSubmitting={isSubmitting}
            />
          </Box>
        </CardContent>
      </Card>

      {isEdit && selectedGroup && <ModifierOptionsPanel groupId={selectedGroup.id} />}
    </Box>
  );
}

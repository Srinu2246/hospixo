'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useModifierGroups } from '../../context/modifier-groups-context';
import type { ModifierGroupStatus } from '../../types/modifier-group-api';
import { ModifierOptionsPanel } from '../options/modifier-options-panel';

export function EditModifierGroupView() {
  const { selectedGroup, updateGroup, backToList } = useModifierGroups();

  const [name, setName] = useState(selectedGroup?.name ?? '');
  const [minSelect, setMinSelect] = useState(String(selectedGroup?.minSelect ?? 0));
  const [maxSelect, setMaxSelect] = useState(String(selectedGroup?.maxSelect ?? 1));
  const [isRequired, setIsRequired] = useState(selectedGroup?.isRequired ?? false);
  const [status, setStatus] = useState<ModifierGroupStatus>(
    (selectedGroup?.status as ModifierGroupStatus) ?? 'active',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedGroup) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    const min = Number(minSelect);
    const max = Number(maxSelect);
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
      setError('Enter valid minimum and maximum selection limits (min <= max).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await updateGroup(selectedGroup!.id, {
      name: name.trim(),
      minSelect: min,
      maxSelect: max,
      isRequired,
      status,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? 'Failed to update modifier group.');
    }
  }

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      {/* Sticky Breadcrumb Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: -16, md: -24 },
          zIndex: 10,
          mx: { xs: -2, md: -3 },
          mt: { xs: -2, md: -3 },
          mb: 2.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
          sx={{ fontSize: '0.8125rem' }}
        >
          <Typography
            component={Link}
            href="/company"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Dashboard
          </Typography>
          <Typography
            onClick={backToList}
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Modifier Groups
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}>
            Edit {selectedGroup.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft size={16} />}
          onClick={backToList}
          sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Edit Modifier Group
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update settings for {selectedGroup.name}
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            Group Configuration
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
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="editGroupName"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Group Name *
              </Typography>
              <TextField
                id="editGroupName"
                hiddenLabel
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="editMinSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Minimum Selections
                </Typography>
                <TextField
                  id="editMinSelect"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                  value={minSelect}
                  onChange={(e) => setMinSelect(e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="editMaxSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Maximum Selections
                </Typography>
                <TextField
                  id="editMaxSelect"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                  value={maxSelect}
                  onChange={(e) => setMaxSelect(e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="editGroupStatus"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  id="editGroupStatus"
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Customer must make a selection (Required)
                </Typography>
              }
            />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                onClick={backToList}
                disabled={isSubmitting}
                sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  height: 40,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <ModifierOptionsPanel groupId={selectedGroup.id} />
    </Box>
  );
}

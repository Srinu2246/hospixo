'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useMenu } from '../../context/menu-context';
import { BranchScopeSelector } from '../shared/branch-scope-selector';
import type { MenuScopeSelection } from '../../lib/menu-scope';
import {
  canSubmitCategoryForm,
  getCategoryFormValidationError,
} from '../../lib/category-form-validation';

export function CreateCategoryView() {
  const { pageConfig, categories, addCategory, backToList } = useMenu();
  const [name, setName] = useState('');
  const [scopeSelection, setScopeSelection] = useState<MenuScopeSelection>({
    scope: 'company',
    assignBranchId: null,
  });
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresScopeSelection = pageConfig?.scope === 'company';

  const canSubmit = useMemo(
    () =>
      canSubmitCategoryForm({
        name,
        requiresScopeSelection,
        scope: scopeSelection.scope,
        assignBranchId: scopeSelection.assignBranchId,
      }),
    [name, requiresScopeSelection, scopeSelection.assignBranchId, scopeSelection.scope],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !canSubmit) return;

    const validationError = getCategoryFormValidationError({
      name,
      requiresScopeSelection,
      scope: scopeSelection.scope,
      assignBranchId: scopeSelection.assignBranchId,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addCategory({
        name: name.trim(),
        parentId: parentId || undefined,
        status,
        description: description.trim() || undefined,
        scope: pageConfig?.scope === 'company' ? scopeSelection.scope : 'branch',
        assignBranchId:
          pageConfig?.scope === 'company' && scopeSelection.scope === 'branch'
            ? (scopeSelection.assignBranchId ?? undefined)
            : undefined,
      });

      if (!result.ok) {
        setError(result.message ?? 'Failed to save category.');
      }
    } catch {
      setError('Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      {/* Breadcrumb Sticky Bar */}
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
          <Link
            component="button"
            type="button"
            onClick={backToList}
            underline="hover"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Home
          </Link>
          <Link
            component="button"
            type="button"
            onClick={backToList}
            underline="hover"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Menu Creation
          </Link>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Create Category
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header with Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={backToList}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Create Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new group category to organize your menu items.
          </Typography>
        </Box>
      </Box>

      {/* Main Card */}
      <Paper
        variant="outlined"
        component="form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: '12px' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Configuration
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Configure hierarchy, visibility, and scope for this category.
        </Typography>

        {pageConfig?.scope === 'company' && (
          <Box sx={{ mb: 2.5 }}>
            <BranchScopeSelector
              value={scopeSelection}
              onChange={(next) => {
                setScopeSelection(next);
                if (error) setError(null);
              }}
            />
            {requiresScopeSelection &&
              scopeSelection.scope === 'branch' &&
              !scopeSelection.assignBranchId && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Select an outlet for branch-only categories.
                </Alert>
              )}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              component="label"
              htmlFor="catName"
              sx={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Category Name *
            </Typography>
            <TextField
              id="catName"
              hiddenLabel
              placeholder="e.g., Desserts"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              error={Boolean(error)}
              helperText={error}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="catParent"
              sx={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Parent Category
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                id="catParent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={isSubmitting}
                displayEmpty
                sx={{ height: 40, borderRadius: '8px' }}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="catStatus"
              sx={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                id="catStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                disabled={isSubmitting}
                sx={{ height: 40, borderRadius: '8px' }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography
            component="label"
            htmlFor="catDesc"
            sx={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.secondary',
              mb: 0.75,
            }}
          >
            Description
          </Typography>
          <TextField
            id="catDesc"
            hiddenLabel
            placeholder="Provide a brief description of items in this category for both staff and online ordering systems."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            multiline
            rows={3}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            mt: 2.5,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            onClick={backToList}
            disabled={isSubmitting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !canSubmit}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2.5 }}
          >
            {isSubmitting ? 'Saving...' : 'Save Category'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

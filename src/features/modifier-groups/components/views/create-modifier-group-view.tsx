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
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useModifierGroups } from '../../context/modifier-groups-context';

export function CreateModifierGroupView() {
  const { createGroup, backToList } = useModifierGroups();

  const [name, setName] = useState('');
  const [minSelect, setMinSelect] = useState('0');
  const [maxSelect, setMaxSelect] = useState('1');
  const [isRequired, setIsRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const result = await createGroup({
      name: name.trim(),
      minSelect: min,
      maxSelect: max,
      isRequired,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? 'Failed to create modifier group.');
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
            Create Modifier Group
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
            Create Modifier Group
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up customization choices for menu items.
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
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
                htmlFor="groupName"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Group Name *
              </Typography>
              <TextField
                id="groupName"
                hiddenLabel
                placeholder="e.g. Spice Level, Extra Cheese, Milk Choice"
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
                  htmlFor="minSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Minimum Selections
                </Typography>
                <TextField
                  id="minSelect"
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
                  htmlFor="maxSelect"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Maximum Selections
                </Typography>
                <TextField
                  id="maxSelect"
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
                {isSubmitting ? 'Saving...' : 'Create Modifier Group'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

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
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { usePreparationStations } from '../../context/preparation-stations-context';

export function CreatePreparationStationView() {
  const { createStation, backToList } = usePreparationStations();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Station name and code are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createStation({
      name: name.trim(),
      code: code.trim().toUpperCase(),
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? 'Failed to create preparation station.');
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
            Preparation Stations
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}>
            Create Preparation Station
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
            Create Preparation Station
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Route menu items and order tickets to specific kitchen or bar stations.
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            Station Information
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
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="stationName"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Station Name *
                </Typography>
                <TextField
                  id="stationName"
                  hiddenLabel
                  placeholder="e.g. Hot Kitchen, Salad Counter, Bar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="stationCode"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Station Code *
                </Typography>
                <TextField
                  id="stationCode"
                  hiddenLabel
                  placeholder="e.g. KITCHEN_1, BAR_A, GRILL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>
            </Box>

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
                {isSubmitting ? 'Saving...' : 'Create Station'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

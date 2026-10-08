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

import { useGstRates } from '../../context/gst-rates-context';

function toDateTimeLocalValue(iso?: string): string {
  if (!iso) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function CreateGstRateView() {
  const { createRate, backToList } = useGstRates();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [cgstRate, setCgstRate] = useState('2.5');
  const [sgstRate, setSgstRate] = useState('2.5');
  const [igstRate, setIgstRate] = useState('5');
  const [totalRate, setTotalRate] = useState('5');
  const [effectiveFrom, setEffectiveFrom] = useState(toDateTimeLocalValue());
  const [effectiveTo, setEffectiveTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function syncTotalFromSplit(nextCgst: string, nextSgst: string, nextIgst: string) {
    const cgst = Number(nextCgst) || 0;
    const sgst = Number(nextSgst) || 0;
    const igst = Number(nextIgst) || 0;
    const splitTotal = cgst + sgst;
    setTotalRate(String(splitTotal > 0 ? splitTotal : igst));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Code and name are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createRate({
      code: code.trim(),
      name: name.trim(),
      cgstRate: Number(cgstRate) || 0,
      sgstRate: Number(sgstRate) || 0,
      igstRate: Number(igstRate) || 0,
      totalRate: Number(totalRate) || 0,
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? 'Failed to create GST rate.');
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
            GST Rates
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}>
            Create GST Rate
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
            Create GST Rate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define a GST slab with CGST, SGST, and IGST components.
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Rate Configuration
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
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="gstCode"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  GST Slab Code *
                </Typography>
                <TextField
                  id="gstCode"
                  hiddenLabel
                  placeholder="e.g. GST_5, GST_12, GST_18, EXEMPT"
                  helperText="Tax slab code for GST compliance."
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="gstName"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  GST Slab Name *
                </Typography>
                <TextField
                  id="gstName"
                  hiddenLabel
                  placeholder="e.g. Standard Food (5%)"
                  helperText="Descriptive name printed on invoices."
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
                  htmlFor="totalRate"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Total Rate (%)
                </Typography>
                <TextField
                  id="totalRate"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  value={totalRate}
                  onChange={(e) => setTotalRate(e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="cgstRate"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  CGST (%)
                </Typography>
                <TextField
                  id="cgstRate"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  value={cgstRate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCgstRate(next);
                    syncTotalFromSplit(next, sgstRate, igstRate);
                  }}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="sgstRate"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  SGST (%)
                </Typography>
                <TextField
                  id="sgstRate"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  value={sgstRate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSgstRate(next);
                    syncTotalFromSplit(cgstRate, next, igstRate);
                  }}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="igstRate"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  IGST (%)
                </Typography>
                <TextField
                  id="igstRate"
                  hiddenLabel
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  value={igstRate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setIgstRate(next);
                    syncTotalFromSplit(cgstRate, sgstRate, next);
                  }}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="effectiveFrom"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Effective From
                </Typography>
                <TextField
                  id="effectiveFrom"
                  hiddenLabel
                  type="datetime-local"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="effectiveTo"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Effective To
                </Typography>
                <TextField
                  id="effectiveTo"
                  hiddenLabel
                  type="datetime-local"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
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
                {isSubmitting ? 'Saving...' : 'Create GST Rate'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

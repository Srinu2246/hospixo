'use client';

import { Box, Chip, Typography, Stack, Alert } from '@mui/material';
import { useFeatureFlag, useFeatureFlagValue } from './useFeatureFlag';
import { FeatureGate } from './FeatureGate';

/**
 * Example demonstrating how application code consumes feature flags
 * using the key `new-test-generation`.
 */
export function ExampleFeatureUsage() {
  // 1. Hook usage: check boolean status with safe default
  const isNewTestGenOn = useFeatureFlag('new-test-generation', false);

  // 2. Value usage: retrieve configuration or string/numeric variants
  const layoutVariant = useFeatureFlagValue('new-test-generation-variant', 'standard');

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">
          GrowthBook Feature Flag Demo: <code>new-test-generation</code>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">useFeatureFlag Hook:</Typography>
          <Chip
            label={isNewTestGenOn ? 'Enabled' : 'Disabled'}
            color={isNewTestGenOn ? 'success' : 'default'}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            (Variant: {layoutVariant})
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            FeatureGate Component:
          </Typography>
          <FeatureGate
            flag="new-test-generation"
            fallback={
              <Alert severity="info" sx={{ py: 0.5 }}>
                Default interface active. Toggle <code>new-test-generation</code> in GrowthBook
                dashboard to view the new experience.
              </Alert>
            }
          >
            <Alert severity="success" sx={{ py: 0.5 }}>
              🎉 New Test Generation experience is active and loaded!
            </Alert>
          </FeatureGate>
        </Box>
      </Stack>
    </Box>
  );
}

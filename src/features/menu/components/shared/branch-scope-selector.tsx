'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import StoreIcon from '@mui/icons-material/Store';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';

import { branchOptionsFromDashboardOutlets } from '@/lib/branches-cache';
import { useOptionalDashboardData } from '@/context/dashboard-data';
import type { MenuScope } from '../../lib/menu-store';
import type { MenuScopeSelection } from '../../lib/menu-scope';

type BranchScopeSelectorProps = Readonly<{
  value: MenuScopeSelection;
  onChange: (value: MenuScopeSelection) => void;
  disabled?: boolean;
  showCompanyOption?: boolean;
}>;

export function BranchScopeSelector({
  value,
  onChange,
  disabled = false,
  showCompanyOption = true,
}: BranchScopeSelectorProps) {
  const dashboardData = useOptionalDashboardData()?.data;
  const branches = useMemo(
    () => branchOptionsFromDashboardOutlets(dashboardData?.outlets),
    [dashboardData?.outlets],
  );
  const loading = false;
  const error: string | null = null;

  function setScope(scope: MenuScope) {
    if (scope === 'company') {
      onChange({ scope: 'company', assignBranchId: null });
      return;
    }

    const fallbackBranchId = value.assignBranchId ?? branches[0]?.id ?? null;
    onChange({ scope: 'branch', assignBranchId: fallbackBranchId });
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
        <StoreIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Menu scope
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Company-wide items sync to all outlets. Branch-only items stay on one outlet.
          </Typography>
        </Box>
      </Box>

      <RadioGroup
        row
        value={value.scope}
        onChange={(e) => setScope(e.target.value as MenuScope)}
        aria-label="Menu scope"
        sx={{ gap: 2, mb: value.scope === 'branch' ? 2 : 0 }}
      >
        {showCompanyOption && (
          <FormControlLabel
            value="company"
            disabled={disabled}
            control={<Radio size="small" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PublicIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  All outlets (company)
                </Typography>
              </Box>
            }
          />
        )}

        <FormControlLabel
          value="branch"
          disabled={disabled || branches.length === 0}
          control={<Radio size="small" />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Single outlet (branch)
              </Typography>
            </Box>
          }
        />
      </RadioGroup>

      {value.scope === 'branch' && (
        <FormControl fullWidth size="small" sx={{ mt: 1.5, maxWidth: 360 }}>
          <InputLabel id="menu-scope-branch-label">Outlet</InputLabel>
          <Select
            labelId="menu-scope-branch-label"
            id="menuScopeBranch"
            value={value.assignBranchId ?? ''}
            label="Outlet"
            disabled={disabled || loading || branches.length === 0}
            onChange={(event) =>
              onChange({
                scope: 'branch',
                assignBranchId: event.target.value || null,
              })
            }
          >
            <MenuItem value="" disabled>
              {loading ? 'Loading outlets…' : 'Select outlet'}
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}

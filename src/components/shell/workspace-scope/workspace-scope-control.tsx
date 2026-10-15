'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { ChevronDown, MapPin } from 'lucide-react';

import { useWorkspaceScopeChrome } from '@/components/shell/workspace-scope/use-workspace-scope-chrome';
import { workspaceMobileChromeCopy } from '@/config/shell/workspace-mobile-chrome';

const scopeSelectSx = {
  height: 32,
  minWidth: 0,
  maxWidth: '100%',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'text.primary',
  borderRadius: '0.5rem',
  bgcolor: 'transparent',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    py: 0.5,
    pl: 0,
    pr: 3,
  },
};

const scopeMenuProps = {
  slotProps: {
    paper: {
      elevation: 4,
      sx: {
        mt: 0.75,
        borderRadius: '0.75rem',
        border: 1,
        borderColor: 'divider',
        maxHeight: 320,
        boxShadow: (theme: Theme) =>
          theme.palette.mode === 'dark'
            ? '0 10px 25px -5px rgba(0,0,0,0.5)'
            : '0 10px 25px -5px rgba(0,0,0,0.1)',
      },
    },
  },
};

type WorkspaceScopeControlProps = Readonly<{
  showOutlets?: boolean;
}>;

export function WorkspaceScopeControl({ showOutlets = true }: WorkspaceScopeControlProps) {
  const model = useWorkspaceScopeChrome(showOutlets);

  if (!model) return null;

  return (
    <Box sx={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', gap: 0.125 }}>
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          lineHeight: 1.1,
        }}
      >
        {model.eyebrow}
      </Typography>

      {model.readOnlyBranchName ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <MapPin size={14} style={{ flexShrink: 0, opacity: 0.75 }} aria-hidden />
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {model.readOnlyBranchName}
          </Typography>
        </Box>
      ) : model.organisationMode ? (
        <Select
          size="small"
          displayEmpty
          value={model.selectedCompanyId}
          onChange={(event) => model.onCompanyChange(event.target.value as string)}
          IconComponent={(props) => (
            <ChevronDown
              size={14}
              {...props}
              style={{ position: 'absolute', right: 0, pointerEvents: 'none', ...props.style }}
            />
          )}
          renderValue={(val) => {
            if (!val) {
              return workspaceMobileChromeCopy.allCompaniesLabel;
            }
            const company = model.companies.find((c) => c.id === val);
            return company?.name ?? val;
          }}
          sx={scopeSelectSx}
          MenuProps={scopeMenuProps}
          aria-label={workspaceMobileChromeCopy.selectCompanyPlaceholder}
        >
          <MenuItem value="" disabled sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {workspaceMobileChromeCopy.selectCompanyPlaceholder}
          </MenuItem>
          {model.companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Select
          size="small"
          value={model.effectiveOutletValue}
          onChange={(event) => model.onOutletChange(event.target.value as string)}
          IconComponent={(props) => (
            <ChevronDown
              size={14}
              {...props}
              style={{ position: 'absolute', right: 0, pointerEvents: 'none', ...props.style }}
            />
          )}
          sx={scopeSelectSx}
          MenuProps={scopeMenuProps}
          aria-label={model.eyebrow}
        >
          {model.outlets.map((outlet) => (
            <MenuItem key={outlet.id} value={outlet.id}>
              {outlet.name}
            </MenuItem>
          ))}
        </Select>
      )}
    </Box>
  );
}

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

// Icons
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AddIcon from '@mui/icons-material/Add';

import { useRoleTemplates } from '@/lib/hooks/employees/user-roles';
import type {
  RoleTemplateItem,
  ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';

export interface RoleTemplateSelectionProps {
  onSelectTemplate: (template: RoleTemplateItem) => void;
  onCreateRoleClick: () => void;
  onBackToUsers: () => void;
  scope?: ScopeType;
}

function renderTemplateIcon(type: RoleTemplateItem['icon']) {
  const iconSx = { fontSize: 22, color: colors.primary.default };

  switch (type) {
    case 'company':
      return <AssignmentOutlinedIcon sx={iconSx} />;
    case 'restaurant':
      return <StorefrontOutlinedIcon sx={iconSx} />;
    case 'pos':
      return <PointOfSaleOutlinedIcon sx={iconSx} />;
    case 'captain':
      return <SearchOutlinedIcon sx={iconSx} />;
    case 'kitchen':
      return <RestaurantMenuOutlinedIcon sx={iconSx} />;
  }
}

export function RoleTemplateSelection({
  onSelectTemplate,
  onCreateRoleClick,
  onBackToUsers,
  scope = 'company',
}: Readonly<RoleTemplateSelectionProps>) {
  const templatesQuery = useRoleTemplates(scope);
  const templates = templatesQuery.data ?? [];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* Top Breadcrumb Bar - White background ONLY for breadcrumb, solid light black line without padding on line */}
      <Box
        sx={{
          mt: { [screen.mobile]: -2, [screen.desktop]: -3 },
          mx: { [screen.mobile]: -2, [screen.desktop]: -3 },
          px: { [screen.mobile]: 2, [screen.desktop]: 3 },
          py: 1.5,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
          borderBottom: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <Breadcrumbs
          items={[
            { label: 'Users & Roles', onClick: onBackToUsers },
            { label: 'Template', active: true },
          ]}
          activeSx={{ color: colors.primary.default, fontWeight: 600 }}
        />
      </Box>

      {/* Header Card with Title and Create Template Button */}
      <Card
        variant="outlined"
        padding={3}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              Select a Role Template
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mt: 0.5, fontSize: '0.875rem' }}
            >
              Choose a starting template to configure specific permissions.
            </Typography>
          </Box>

          <ActionButton
            variant="primary"
            disabled
            onClick={onCreateRoleClick}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Create Role
          </ActionButton>
        </Box>
      </Card>

      {templatesQuery.isError ? (
        <AlertMessage variant="error" message="Unable to load role templates." />
      ) : null}
      {templatesQuery.isLoading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <Loading message="Loading templates…" fullPage={false} />
        </Box>
      ) : null}

      {/* Grid of Role Templates (Compact 24px Card styling) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: scope === 'company' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            lg: scope === 'company' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          },
          gap: 2.5,
          pt: 0.5,
        }}
      >
        {templates.map((template) => (
          <Card
            key={template.id}
            variant="outlined"
            padding={3}
            onClick={() => onSelectTemplate(template)}
            sx={{
              borderRadius: '12px',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: 140,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'none',
              '&:hover': {
                borderColor: colors.primary.default,
                boxShadow: `0 4px 16px ${colors.sidebar.activeGlow}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(51, 84, 244, 0.18)'
                    : 'rgba(51, 84, 244, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderTemplateIcon(template.icon)}
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                {template.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: colors.text.secondary,
                  mt: 0.5,
                  lineHeight: 1.45,
                }}
              >
                {template.description}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

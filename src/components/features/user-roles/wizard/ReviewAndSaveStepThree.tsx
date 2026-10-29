'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { isFallbackEntityName } from '@/lib/helpers/employees/userRolesHelpers';
import type {
  CreateUserFormValues,
  PermissionCategory,
  RoleAssignmentRequirements,
  RoleTemplateItem,
  ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { PermissionGroupsGrid } from '../PermissionGroupsGrid';

export interface ReviewAndSaveStepThreeProps {
  formValues: CreateUserFormValues;
  selectedTemplate: RoleTemplateItem | null;
  categories: PermissionCategory[];
  assignment: RoleAssignmentRequirements;
  wizardScope: ScopeType;
  onEditSection: (step: 'template' | 'user-form' | 'permissions') => void;
}

function ReviewField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

function displayValue(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isFallbackEntityName(trimmed)) return undefined;
  return trimmed;
}

function shouldShowCompanyOnReview(
  assignment: RoleAssignmentRequirements,
  wizardScope: ScopeType,
): boolean {
  return assignment.showCompany || wizardScope === 'company';
}

export function ReviewAndSaveStepThree({
  formValues,
  selectedTemplate,
  categories,
  assignment,
  wizardScope,
  onEditSection,
}: Readonly<ReviewAndSaveStepThreeProps>) {
  const phoneDisplay = useMemo(() => {
    const number = formValues.phoneNumber?.trim();
    if (!number) return undefined;
    const code = formValues.countryCode?.trim();
    return code ? `${code} ${number}` : number;
  }, [formValues.countryCode, formValues.phoneNumber]);

  const userInfoFields = useMemo(() => {
    const fields: { label: string; value: string }[] = [];

    const firstName = displayValue(formValues.firstName);
    if (firstName) fields.push({ label: 'First Name', value: firstName });

    const lastName = displayValue(formValues.lastName);
    if (lastName) fields.push({ label: 'Last Name', value: lastName });

    const email = displayValue(formValues.email);
    if (email) fields.push({ label: 'Email Address', value: email });

    if (phoneDisplay) fields.push({ label: 'Phone Number', value: phoneDisplay });

    const username = displayValue(formValues.username);
    if (username) fields.push({ label: 'Username', value: username });

    if (formValues.password?.trim()) {
      fields.push({ label: 'Password', value: '••••••••' });
    }

    if (shouldShowCompanyOnReview(assignment, wizardScope)) {
      const company = displayValue(formValues.company);
      if (company) fields.push({ label: 'Company', value: company });
    }

    if (assignment.showBranch || wizardScope === 'branch') {
      const branch = displayValue(formValues.branch);
      if (branch) fields.push({ label: 'Branch', value: branch });
    }

    const role = displayValue(formValues.role);
    if (role) fields.push({ label: 'Role', value: role });

    return fields;
  }, [assignment, formValues, phoneDisplay, wizardScope]);

  const roleName = displayValue(formValues.role) ?? displayValue(selectedTemplate?.title);
  const roleDescription = displayValue(selectedTemplate?.description);
  const templateTitle = displayValue(selectedTemplate?.title) ?? roleName;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      <Box sx={{ display: { [screen.mobile]: 'block', [screen.desktop]: 'none' } }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'text.primary',
            letterSpacing: '-0.015em',
          }}
        >
          Review Details
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: colors.text.secondary, mt: 0.75, fontSize: '0.875rem' }}
        >
          Confirm user information and permissions
        </Typography>
      </Box>

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Role Summary
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit role summary"
            onClick={() => onEditSection('template')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              [screen.mobile]: '1fr',
              [screen.tablet]: '1fr',
              [screen.desktop]: '1.2fr 2fr 1fr',
            },
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              ROLE NAME
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {roleName ?? '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              DESCRIPTION
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.45,
              }}
            >
              {roleDescription ?? '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              TEMPLATE
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {templateTitle ?? '—'}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card
        variant="outlined"
        padding={3}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            User Information
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit user information"
            onClick={() => onEditSection('user-form')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {userInfoFields.length === 0 ? (
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
            No user details entered yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                [screen.mobile]: '1fr',
                [screen.tablet]: '1fr 1fr',
                [screen.desktop]: '1fr 1fr',
              },
              columnGap: { [screen.mobile]: 2, [screen.desktop]: 4 },
              rowGap: 2,
            }}
          >
            {userInfoFields.map((field) => (
              <ReviewField key={field.label} label={field.label} value={field.value} />
            ))}
          </Box>
        )}
      </Card>

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Permissions Review
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit permissions"
            onClick={() => onEditSection('permissions')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {categories.length === 0 ? (
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
            No permissions loaded. Go back to configure permissions.
          </Typography>
        ) : (
          <PermissionGroupsGrid
            categories={categories}
            readOnly
            badgeMode="enabled"
            showEnabledOnly
          />
        )}
      </Card>
    </Box>
  );
}

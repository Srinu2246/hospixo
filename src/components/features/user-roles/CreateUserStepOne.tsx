'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/form-fields/Input';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import { colors } from '@/lib/theme/mui/colors';

import { createUserMultiformSchema } from '@/lib/schemas/user-roles';
import { DEFAULT_COMPANIES, DEFAULT_BRANCHES } from '@/lib/mocks/employees/multiform.mocks';
import {
  ROLE_OPTIONS,
  COMPANY_ROLE_OPTIONS,
  COMPANY_BRANCH_OPTIONS,
  BRANCH_ROLE_OPTIONS,
  BRANCH_BRANCH_OPTIONS,
} from '@/lib/mocks/employees/useUserRoles.mocks';
import type { CreateUserFormValues, ScopeType } from '@/types/user-roles';
import { useCreateUserStore } from '@/stores/createUserStore';

export interface CreateUserStepOneProps {
  onValidSubmit?: (values: CreateUserFormValues) => void;
  scope?: ScopeType;
  companyName?: string;
}

export function CreateUserStepOne({
  onValidSubmit,
  scope,
  companyName = 'VJITVI',
}: Readonly<CreateUserStepOneProps>) {
  const { formValues, updateFormField, setFormValues, scope: storeScope } = useCreateUserStore();
  const currentScope = scope || storeScope || 'company';
  const roleOptions =
    currentScope === 'branch'
      ? BRANCH_ROLE_OPTIONS
      : currentScope === 'company'
        ? COMPANY_ROLE_OPTIONS
        : ROLE_OPTIONS;
  const branchOptions =
    currentScope === 'branch'
      ? BRANCH_BRANCH_OPTIONS
      : currentScope === 'company'
        ? COMPANY_BRANCH_OPTIONS
        : DEFAULT_BRANCHES;

  // Established React Hook Form v7 pattern with Zod v4 resolver
  const { control, handleSubmit, setValue, reset } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserMultiformSchema),
    defaultValues: formValues,
    mode: 'onBlur',
  });

  // Keep React Hook Form in sync if store values update externally
  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  const handleFieldChange = (field: keyof CreateUserFormValues, value: string | boolean) => {
    setValue(field, value as string, { shouldValidate: true, shouldDirty: true });
    updateFormField(field, value);
  };

  const handleFormSubmit = (data: CreateUserFormValues) => {
    setFormValues(data);
    onValidSubmit?.(data);
  };

  return (
    <Box
      component="form"
      id="create-user-step-one-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}
    >
      {/* Form Card (32px padding matching Figma layout) */}
      <Card
        variant="outlined"
        padding={4}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.375rem' },
                color: 'text.primary',
                letterSpacing: '-0.015em',
              }}
            >
              Create New User
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mt: 0.75, fontSize: '0.875rem' }}
            >
              Add a new user to the system
            </Typography>
          </Box>

          {/* Section: Staff Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Staff Information
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                columnGap: { xs: 2, md: 4 },
                rowGap: 3,
              }}
            >
              {/* First Name */}
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="FIRST NAME"
                    required
                    placeholder="Enter first name"
                    value={field.value}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="LAST NAME"
                    required
                    placeholder="Enter last name"
                    value={field.value}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              {/* Phone Number (Reusing shared MobileNumberInput) */}
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <MobileNumberInput
                    label="PHONE NUMBER"
                    required
                    placeholder="555 000 0000"
                    phoneNumber={field.value}
                    onPhoneNumberChange={(value) => handleFieldChange('phoneNumber', value)}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              {/* Email Address */}
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="EMAIL ADDRESS"
                    required
                    type="email"
                    placeholder="e.g. sarah.chen@example.com"
                    value={field.value}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              {/* Username */}
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="USERNAME"
                    required
                    placeholder="Create Username"
                    value={field.value}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="PASSWORD"
                    required
                    type="password"
                    placeholder="Create Password"
                    value={field.value}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onBlur={field.onBlur}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Box>
          </Box>

          {/* Company & Branch Assignment */}
          {currentScope === 'branch' ? (
            /* Branch Scope: Single 2-Column Row with Assign Branch and Assign Role */
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                columnGap: { xs: 2, md: 4 },
                rowGap: 3,
              }}
            >
              {/* Assign Branch */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                  Assign Branch
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  SELECT BRANCH
                </Typography>
                <Box
                  sx={{
                    height: 40,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.06)'
                        : colors.white.default,
                    px: 1.75,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'default',
                    userSelect: 'none',
                  }}
                >
                  {formValues.branch || 'Downtown Branch'}
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
                  The user will only see data for the selected branch.
                </Typography>
              </Box>

              {/* Assign Role */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                  Assign Role
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  SELECT ROLE
                </Typography>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      options={roleOptions}
                      value={field.value || 'Captain'}
                      onChange={(val) => handleFieldChange('role', val)}
                      sx={{ width: '100%' }}
                    />
                  )}
                />
              </Box>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  columnGap: { xs: 2, md: 4 },
                  rowGap: 3,
                }}
              >
                {/* Assign Company */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                    Assign Company
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: colors.text.secondary,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    SELECT COMPANY
                  </Typography>
                  {currentScope === 'company' ? (
                    <Box
                      sx={{
                        height: 40,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? theme.palette.divider
                            : colors.border.default,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#EAEFF5',
                        px: 1.75,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'default',
                        userSelect: 'none',
                      }}
                    >
                      {companyName || formValues.company || 'VJITVI'}
                    </Box>
                  ) : (
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={DEFAULT_COMPANIES}
                          value={field.value}
                          onChange={(val) => handleFieldChange('company', val)}
                          sx={{ width: '100%' }}
                        />
                      )}
                    />
                  )}
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
                    The user will only see data for the selected branch.
                  </Typography>
                </Box>

                {/* Assign Branch */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                    Assign Branch
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: colors.text.secondary,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    SELECT BRANCH
                  </Typography>
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        options={branchOptions}
                        value={field.value}
                        onChange={(val) => handleFieldChange('branch', val)}
                        sx={{ width: '100%' }}
                      />
                    )}
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
                    The user will only see data for the selected branch.
                  </Typography>
                </Box>
              </Box>

              {/* Assign Role (Aligned directly within Column 1 for exact pixel grid alignment) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  columnGap: { xs: 2, md: 4 },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                    Assign Role
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: colors.text.secondary,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    SELECT ROLE
                  </Typography>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        options={roleOptions}
                        value={field.value}
                        onChange={(val) => handleFieldChange('role', val)}
                        sx={{ width: '100%' }}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }} />
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

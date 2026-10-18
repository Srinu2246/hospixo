'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/form-fields/Input';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import { colors } from '@/lib/theme/mui/colors';

import {
  buildCreateUserStepOneSchema,
  parseRoleCatalog,
  type CreateUserFormValues,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { useEmployeeDirectory, useRoleCatalogQuery } from '@/lib/hooks/employees/user-roles';
import { useCreateUserStore } from '@/stores/createUserStore';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface CreateUserStepOneProps {
  onValidSubmit?: (values: CreateUserFormValues) => void;
  scope?: ScopeType;
  companyName?: string;
}

export function CreateUserStepOne({
  onValidSubmit,
  scope,
  companyName,
}: Readonly<CreateUserStepOneProps>) {
  const {
    formValues,
    updateFormField,
    setFormValues,
    setRoleAndDescription,
    setSelectedRoleId,
    scope: storeScope,
  } = useCreateUserStore();
  const currentScope = scope || storeScope || 'company';
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id ?? undefined);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const contextOrgId = useSidebarStore((state) => state.context.organizationId);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextCompanyName = useSidebarStore((state) => state.context.companyName);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const organizationId = contextOrgId ?? accountOrgId;
  const directoryCompanyId =
    currentScope === 'company' || currentScope === 'branch'
      ? (contextCompanyId ?? accountCompanyId)
      : undefined;
  const directory = useEmployeeDirectory(organizationId, directoryCompanyId);
  const rolesQuery = useRoleCatalogQuery(currentScope);
  const roleCatalog = useMemo(() => {
    if (Array.isArray(rolesQuery.data)) return rolesQuery.data;
    if (rolesQuery.data) return parseRoleCatalog(rolesQuery.data);
    return [];
  }, [rolesQuery.data]);
  const roleOptions = useMemo(() => {
    const names = (Array.isArray(roleCatalog) ? roleCatalog : []).map((role) => role.name);
    return names.length > 0 ? names : ['Staff'];
  }, [roleCatalog]);
  const companyOptions = useMemo(
    () => (directory.data?.companies ?? []).map((company) => company.name),
    [directory.data?.companies],
  );
  const directoryCompanyName = useMemo(() => {
    const companies = directory.data?.companies ?? [];
    const byContext = contextCompanyId
      ? companies.find((company) => String(company.id) === String(contextCompanyId))?.name
      : undefined;
    if (byContext) return byContext;
    if (companies.length === 1) return companies[0]?.name;
    return undefined;
  }, [contextCompanyId, directory.data?.companies]);

  // When in branch scope, resolve the company bound to the active branch
  const branchBoundCompany = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    const companies = directory.data?.companies ?? [];
    const activeBranchName = contextBranchName || formValues.branch;
    const branchId = contextBranchId ?? accountBranchId;

    const matchedBranch =
      branches.find(
        (b) =>
          (branchId != null && String(b.id) === String(branchId)) ||
          (activeBranchName && activeBranchName !== '—' && b.name === activeBranchName),
      ) ?? (branches.length === 1 ? branches[0] : undefined);

    if (!matchedBranch) return undefined;

    if (matchedBranch.companyName?.trim()) {
      return {
        id: matchedBranch.companyId,
        name: matchedBranch.companyName.trim(),
      };
    }

    if (matchedBranch.companyId != null && matchedBranch.companyId !== '') {
      const matchedCompany = companies.find(
        (c) => String(c.id) === String(matchedBranch.companyId),
      );
      if (matchedCompany?.name?.trim()) {
        return {
          id: matchedCompany.id,
          name: matchedCompany.name.trim(),
        };
      }
    }

    return undefined;
  }, [
    directory.data?.branches,
    directory.data?.companies,
    contextBranchName,
    formValues.branch,
    contextBranchId,
    accountBranchId,
  ]);

  const resolvedCompanyLabel =
    contextCompanyName ??
    branchBoundCompany?.name ??
    directoryCompanyName ??
    companyName ??
    (companyOptions.length === 1 ? companyOptions[0] : undefined);
  const lockedCompanyLabel = resolvedCompanyLabel || formValues.company || '—';

  // Established React Hook Form v7 pattern with dynamic Zod v4 resolver per scope
  const validationSchema = useMemo(
    () => buildCreateUserStepOneSchema(roleCatalog, currentScope),
    [roleCatalog, currentScope],
  );

  const { control, handleSubmit, setValue, reset } = useForm<CreateUserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: formValues,
    mode: 'onBlur',
  });

  const branchOptions = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    const activeCompany =
      currentScope === 'company' ? resolvedCompanyLabel || formValues.company : formValues.company;
    const filtered =
      currentScope === 'organization' && activeCompany
        ? branches.filter((branch) => branch.companyName === activeCompany)
        : currentScope === 'company' && directoryCompanyId != null
          ? branches.filter((branch) => String(branch.companyId) === String(directoryCompanyId))
          : branches;
    return filtered.map((branch) => branch.name);
  }, [
    currentScope,
    directory.data?.branches,
    directoryCompanyId,
    formValues.company,
    resolvedCompanyLabel,
  ]);
  const isBranchLoading = directory.isLoading || (directory.isPending && !directory.data);
  const lockedBranchLabel = contextBranchName || formValues.branch || branchOptions[0] || '—';

  // Keep React Hook Form in sync if store values update externally
  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  useEffect(() => {
    if (currentScope !== 'company' && currentScope !== 'branch') return;
    if (!resolvedCompanyLabel || resolvedCompanyLabel === '—') return;
    if (formValues.company === resolvedCompanyLabel) return;
    setValue('company', resolvedCompanyLabel, { shouldValidate: true });
    updateFormField('company', resolvedCompanyLabel);
  }, [currentScope, formValues.company, resolvedCompanyLabel, setValue, updateFormField]);

  useEffect(() => {
    if (!formValues.role && roleOptions.length > 0) {
      const defaultRole = roleOptions[0] || 'Captain';
      setValue('role', defaultRole, { shouldValidate: true });
      updateFormField('role', defaultRole);
      const matched = roleCatalog.find(
        (r) =>
          r.name.toLowerCase() === defaultRole.toLowerCase() ||
          r.code?.toLowerCase() === defaultRole.toLowerCase(),
      );
      if (matched) {
        setSelectedRoleId(matched.id);
        if (matched.description) {
          setRoleAndDescription(matched.name, matched.description, matched.id);
        }
      }
    }
  }, [
    formValues.role,
    roleOptions,
    roleCatalog,
    setValue,
    updateFormField,
    setRoleAndDescription,
    setSelectedRoleId,
  ]);

  useEffect(() => {
    if (!formValues.role || roleCatalog.length === 0) return;
    const matched = roleCatalog.find(
      (r) =>
        r.name.toLowerCase() === formValues.role.toLowerCase() ||
        r.code?.toLowerCase() === formValues.role.toLowerCase(),
    );
    if (matched) {
      setSelectedRoleId(matched.id);
      if (matched.description) {
        setRoleAndDescription(matched.name, matched.description, matched.id);
      }
    }
  }, [formValues.role, roleCatalog, setRoleAndDescription, setSelectedRoleId]);

  useEffect(() => {
    if (isBranchLoading) return;
    if (currentScope === 'branch') {
      const branchToSet = contextBranchName || branchOptions[0];
      if (branchToSet && branchToSet !== '—' && formValues.branch !== branchToSet) {
        setValue('branch', branchToSet, { shouldValidate: true });
        updateFormField('branch', branchToSet);
      }
      return;
    }
    if (
      branchOptions.length > 0 &&
      (!formValues.branch || !branchOptions.includes(formValues.branch))
    ) {
      const firstBranch = branchOptions[0];
      setValue('branch', firstBranch, { shouldValidate: true });
      updateFormField('branch', firstBranch);
    }
  }, [
    isBranchLoading,
    currentScope,
    contextBranchName,
    branchOptions,
    formValues.branch,
    setValue,
    updateFormField,
  ]);

  const handleFieldChange = (field: keyof CreateUserFormValues, value: string | boolean) => {
    setValue(field, value as string, { shouldValidate: true, shouldDirty: true });
    updateFormField(field, value);
    if (field === 'role' && typeof value === 'string') {
      const matched = roleCatalog.find(
        (r) =>
          r.name.toLowerCase() === value.trim().toLowerCase() ||
          r.code?.toLowerCase() === value.trim().toLowerCase(),
      );
      if (matched) {
        setSelectedRoleId(matched.id);
        if (matched.description) {
          setRoleAndDescription(matched.name, matched.description, matched.id);
        }
      }
    }
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
                    countryCode={formValues.countryCode || '+91'}
                    onCountryCodeChange={(code) => handleFieldChange('countryCode', code)}
                    placeholder="98765 43210"
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
                {isBranchLoading ? (
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
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.04)'
                          : colors.surface.muted,
                      px: 1.75,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                    <Typography
                      sx={{ fontSize: '0.875rem', color: colors.text.secondary, fontWeight: 500 }}
                    >
                      Loading branch...
                    </Typography>
                  </Box>
                ) : (
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
                    {lockedBranchLabel}
                  </Box>
                )}
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
                      {lockedCompanyLabel || '—'}
                    </Box>
                  ) : (
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={companyOptions.length > 0 ? companyOptions : ['—']}
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
                  {isBranchLoading ? (
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
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.04)'
                            : colors.surface.muted,
                        px: 1.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                      }}
                    >
                      <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                      <Typography
                        sx={{ fontSize: '0.875rem', color: colors.text.secondary, fontWeight: 500 }}
                      >
                        Loading branches...
                      </Typography>
                    </Box>
                  ) : (
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={branchOptions.length > 0 ? branchOptions : ['—']}
                          value={field.value}
                          onChange={(val) => handleFieldChange('branch', val)}
                          placeholder={
                            branchOptions.length === 0 ? 'No branches available' : 'Select branch'
                          }
                          sx={{ width: '100%' }}
                        />
                      )}
                    />
                  )}
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

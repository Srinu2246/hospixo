'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

import {
  buildCreateUserStepOneSchema,
  parseRoleCatalog,
  type CreateUserFormValues,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { useEmployeeDirectory, useRoleCatalogQuery } from '@/lib/hooks/employees/user-roles';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { useCreateUserStore } from '@/stores/createUserStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { CreateUserStaffInfoSection } from './create-user/CreateUserStaffInfoSection';
import { CreateUserAssignmentSection } from './create-user/CreateUserAssignmentSection';

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
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const organizationId = contextOrgId ?? accountOrgId;
  const directoryCompanyId =
    currentScope === 'branch'
      ? (accountCompanyId ?? contextCompanyId)
      : (contextCompanyId ?? accountCompanyId);

  const directory = useEmployeeDirectory(organizationId, directoryCompanyId);

  const rolesQuery = useRoleCatalogQuery();
  const roleCatalog = useMemo(() => parseRoleCatalog(rolesQuery.data), [rolesQuery.data]);

  const roleOptions = useMemo(() => {
    const list = roleCatalog.filter((r) => !r.scope || r.scope === currentScope).map((r) => r.name);
    return list.length > 0 ? list : ['Captain', 'Cashier', 'Kitchen Staff'];
  }, [roleCatalog, currentScope]);

  const companyOptions = useMemo(() => {
    const fromDir = (directory.data?.companies ?? []).map((c) => c.name).filter(Boolean);
    if (fromDir.length > 0) return fromDir;
    const fromBranches = Array.from(
      new Set(
        (directory.data?.branches ?? [])
          .map((b) => b.companyName?.trim())
          .filter((name): name is string => Boolean(name)),
      ),
    );
    return fromBranches;
  }, [directory.data?.companies, directory.data?.branches]);

  const directoryCompanyName = useMemo(() => {
    const companies = directory.data?.companies ?? [];
    const targetCompanyId = contextCompanyId ?? accountCompanyId ?? directoryCompanyId;
    const byContext = targetCompanyId
      ? companies.find((c) => String(c.id) === String(targetCompanyId))?.name
      : undefined;
    if (byContext) return byContext;
    if (companies.length > 0) return companies[0]?.name;
    return undefined;
  }, [contextCompanyId, accountCompanyId, directoryCompanyId, directory.data?.companies]);

  const branchBoundCompany = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    const companies = directory.data?.companies ?? [];
    const branchId = contextBranchId ?? accountBranchId;
    const activeBranchName = contextBranchName || formValues.branch;

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

    if (matchedBranch.companyId != null) {
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

  const sessionCompanyName = useResolvedCompanyName(companyName);

  const resolvedCompanyLabel =
    sessionCompanyName ||
    branchBoundCompany?.name ||
    directoryCompanyName ||
    companyOptions[0] ||
    formValues.company ||
    '—';
  const lockedCompanyLabel = resolvedCompanyLabel;

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

  const validationSchema = useMemo(
    () => buildCreateUserStepOneSchema(roleCatalog, currentScope),
    [roleCatalog, currentScope],
  );

  const { control, handleSubmit, setValue } = useForm<CreateUserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: formValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (resolvedCompanyLabel && !formValues.company) {
      setValue('company', resolvedCompanyLabel, { shouldValidate: false });
    }
  }, [resolvedCompanyLabel, formValues.company, setValue]);

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
    const defaultBranch = currentScope === 'branch' ? lockedBranchLabel : branchOptions[0] || '';
    const defaultRole = roleOptions[0] || 'Captain';
    const effectiveCompany = data.company || lockedCompanyLabel;
    const effectiveBranch = data.branch || defaultBranch;
    const effectiveRole = data.role || defaultRole;

    const matched = roleCatalog.find(
      (r) =>
        r.name.toLowerCase() === effectiveRole.toLowerCase() ||
        r.code?.toLowerCase() === effectiveRole.toLowerCase(),
    );
    if (matched) {
      setSelectedRoleId(matched.id);
      if (matched.description) {
        setRoleAndDescription(matched.name, matched.description, matched.id);
      }
    }

    const finalValues: CreateUserFormValues = {
      ...data,
      company: effectiveCompany === '—' ? '' : effectiveCompany,
      branch: effectiveBranch === '—' ? '' : effectiveBranch,
      role: effectiveRole,
    };
    setFormValues(finalValues);
    onValidSubmit?.(finalValues);
  };

  return (
    <Box
      component="form"
      id="create-user-step-one-form"
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}
    >
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

          <CreateUserStaffInfoSection
            control={control}
            countryCode={formValues.countryCode || '+91'}
            onFieldChange={handleFieldChange}
          />

          <CreateUserAssignmentSection
            control={control}
            currentScope={currentScope}
            companyOptions={companyOptions}
            branchOptions={branchOptions}
            roleOptions={roleOptions}
            lockedCompanyLabel={lockedCompanyLabel}
            lockedBranchLabel={lockedBranchLabel}
            isBranchLoading={isBranchLoading}
            onFieldChange={handleFieldChange}
          />
        </Box>
      </Card>
    </Box>
  );
}

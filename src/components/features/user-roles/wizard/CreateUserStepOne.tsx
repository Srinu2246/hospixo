'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

import {
  DEFAULT_FALLBACK_ROLES,
  buildCreateUserStepOneSchema,
  parseRoleCatalog,
  resolveRoleAssignmentRequirements,
  type CreateUserFormValues,
  type RoleCatalogItem,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  resolveCreateUserBranchOptions,
  resolveEmployeeDirectoryOptions,
} from '@/lib/helpers/employees/userRolesHelpers';
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
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const organizationId = contextOrgId ?? accountOrgId;

  const directoryQuery = useMemo(
    () =>
      resolveEmployeeDirectoryOptions({
        wizardScope: currentScope,
        contextCompanyId,
        accountCompanyId,
        role,
        authScope,
      }),
    [currentScope, contextCompanyId, accountCompanyId, role, authScope],
  );
  const directoryCompanyId = directoryQuery.companyId;

  const directory = useEmployeeDirectory(organizationId, directoryCompanyId, {
    scope: directoryQuery.directoryScope,
  });
  const lockCompanyField = directoryQuery.lockCompanyField;

  const rolesQuery = useRoleCatalogQuery(currentScope);
  const roleCatalog = useMemo((): RoleCatalogItem[] => {
    const data = rolesQuery.data;
    if (Array.isArray(data)) return data;
    return data ? parseRoleCatalog(data) : [];
  }, [rolesQuery.data]);

  const roleOptions = useMemo(() => {
    if (roleCatalog.length === 0) return [...DEFAULT_FALLBACK_ROLES];
    return roleCatalog.map((role) => role.name);
  }, [roleCatalog]);

  const assignment = useMemo(
    () => resolveRoleAssignmentRequirements(formValues.role, roleCatalog, currentScope),
    [formValues.role, roleCatalog, currentScope],
  );

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
    const activeCompany =
      currentScope === 'company' ? resolvedCompanyLabel || formValues.company : formValues.company;
    return resolveCreateUserBranchOptions({
      branches: directory.data?.branches ?? [],
      companies: directory.data?.companies ?? [],
      currentScope,
      activeCompanyLabel: activeCompany,
      directoryCompanyId,
      selectedBranchName: formValues.branch,
    });
  }, [
    currentScope,
    directory.data?.branches,
    directory.data?.companies,
    directoryCompanyId,
    formValues.branch,
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
    if (
      lockCompanyField &&
      resolvedCompanyLabel &&
      resolvedCompanyLabel !== '—' &&
      formValues.company !== resolvedCompanyLabel
    ) {
      setValue('company', resolvedCompanyLabel, { shouldValidate: false });
      updateFormField('company', resolvedCompanyLabel);
    }
  }, [lockCompanyField, resolvedCompanyLabel, formValues.company, setValue, updateFormField]);

  useEffect(() => {
    if (assignment.showCompany || lockCompanyField) return;
    if (!formValues.company?.trim()) return;
    setValue('company', '', { shouldValidate: false });
    updateFormField('company', '');
  }, [assignment.showCompany, lockCompanyField, formValues.company, setValue, updateFormField]);

  useEffect(() => {
    if (assignment.showBranch) return;
    if (!formValues.branch?.trim()) return;
    setValue('branch', '', { shouldValidate: false });
    updateFormField('branch', '');
  }, [assignment.showBranch, formValues.branch, setValue, updateFormField]);

  useEffect(() => {
    if (!assignment.showBranch) return;
    const branch = formValues.branch?.trim();
    if (branch && branchOptions.includes(branch)) {
      setValue('branch', branch, { shouldValidate: false });
      return;
    }
    if (!branch && assignment.requireBranch && branchOptions.length > 0) {
      const defaultBranch = branchOptions[0];
      setValue('branch', defaultBranch, { shouldValidate: false });
      updateFormField('branch', defaultBranch);
    }
  }, [
    assignment.requireBranch,
    assignment.showBranch,
    branchOptions,
    formValues.branch,
    setValue,
    updateFormField,
  ]);

  useEffect(() => {
    if (formValues.role || roleOptions.length === 0) return;
    const defaultRole = roleOptions[0];
    if (!defaultRole) return;
    setValue('role', defaultRole, { shouldValidate: false });
    updateFormField('role', defaultRole);
  }, [formValues.role, roleOptions, setValue, updateFormField]);

  const handleFieldChange = (field: keyof CreateUserFormValues, value: string | boolean) => {
    if (field === 'company' && typeof value === 'string') {
      setValue('branch', '', { shouldValidate: false });
      updateFormField('branch', '');
    }
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
    const submitAssignment = resolveRoleAssignmentRequirements(
      data.role,
      roleCatalog,
      currentScope,
    );
    const defaultRole = roleOptions[0] || DEFAULT_FALLBACK_ROLES[0];
    const effectiveRole = data.role || defaultRole;
    const effectiveCompany = submitAssignment.requireCompany
      ? data.company || (currentScope === 'company' ? lockedCompanyLabel : '')
      : currentScope === 'company'
        ? lockedCompanyLabel
        : '';
    const effectiveBranch = submitAssignment.requireBranch
      ? data.branch || (currentScope === 'branch' ? lockedBranchLabel : branchOptions[0] || '')
      : currentScope === 'branch'
        ? lockedBranchLabel
        : '';

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
            assignment={assignment}
            companyOptions={companyOptions}
            branchOptions={branchOptions}
            roleOptions={roleOptions}
            lockedCompanyLabel={lockedCompanyLabel}
            lockCompanyField={lockCompanyField}
            lockedBranchLabel={lockedBranchLabel}
            isBranchLoading={isBranchLoading}
            onFieldChange={handleFieldChange}
          />
        </Box>
      </Card>
    </Box>
  );
}

'use client';

import React, { useMemo } from 'react';
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
  resolveRoleId,
  type CreateUserFormValues,
  type RoleCatalogItem,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  isFallbackEntityName,
  resolveCreateUserBranchOptions,
  resolveEmployeeDirectoryOptions,
} from '@/lib/helpers/employees/userRolesHelpers';
import { useEmployeeDirectory, useRoleCatalogQuery } from '@/lib/hooks/employees/user-roles';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { useResolvedBranchName } from '@/lib/hooks/useResolvedBranchName';
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
    if (byContext && !isFallbackEntityName(byContext)) return byContext;
    const firstReal = companies.find((c) => c.name && !isFallbackEntityName(c.name));
    return firstReal?.name;
  }, [contextCompanyId, accountCompanyId, directoryCompanyId, directory.data?.companies]);

  const sessionCompanyName = useResolvedCompanyName(companyName, { scope: currentScope });
  const sessionBranchName = useResolvedBranchName(formValues.branch, { scope: currentScope });

  const branchId = contextBranchId ?? accountBranchId;

  const matchedBranch = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    const candidate = formValues.branch || sessionBranchName || contextBranchName;
    if (candidate && !isFallbackEntityName(candidate)) {
      const byName = branches.find(
        (b) => b.name?.trim().toLowerCase() === candidate.trim().toLowerCase(),
      );
      if (byName?.name && !isFallbackEntityName(byName.name)) {
        return byName;
      }
    }
    if (branchId != null) {
      const byId = branches.find((b) => String(b.id) === String(branchId));
      if (byId?.name && !isFallbackEntityName(byId.name)) {
        return byId;
      }
    }
    if (branches.length === 1 && !isFallbackEntityName(branches[0]?.name)) {
      return branches[0];
    }
    return branches.find((b) => !isFallbackEntityName(b.name));
  }, [branchId, directory.data, sessionBranchName, formValues.branch, contextBranchName]);

  const branchBoundCompany = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    const companies = directory.data?.companies ?? [];
    const targetBranch = matchedBranch ?? (branches.length === 1 ? branches[0] : undefined);

    if (!targetBranch) return undefined;

    if (targetBranch.companyName?.trim() && !isFallbackEntityName(targetBranch.companyName)) {
      return {
        id: targetBranch.companyId,
        name: targetBranch.companyName.trim(),
      };
    }

    if (targetBranch.companyId != null) {
      const matchedCompany = companies.find((c) => String(c.id) === String(targetBranch.companyId));
      if (matchedCompany?.name?.trim() && !isFallbackEntityName(matchedCompany.name)) {
        return {
          id: matchedCompany.id,
          name: matchedCompany.name.trim(),
        };
      }
    }

    return undefined;
  }, [directory.data, matchedBranch]);

  const resolvedCompanyLabel =
    (currentScope === 'branch' ? branchBoundCompany?.name || sessionCompanyName : undefined) ||
    branchBoundCompany?.name ||
    sessionCompanyName ||
    directoryCompanyName ||
    companyOptions.find((name) => !isFallbackEntityName(name)) ||
    (formValues.company && !isFallbackEntityName(formValues.company)
      ? formValues.company
      : undefined) ||
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

  const resolvedBranchLabel = useMemo(() => {
    if (matchedBranch?.name && !isFallbackEntityName(matchedBranch.name)) {
      return matchedBranch.name.trim();
    }
    if (sessionBranchName && !isFallbackEntityName(sessionBranchName)) {
      return sessionBranchName.trim();
    }
    const realOption = branchOptions.find((opt) => !isFallbackEntityName(opt));
    if (realOption) {
      return realOption.trim();
    }
    if (formValues.branch && !isFallbackEntityName(formValues.branch)) {
      return formValues.branch.trim();
    }
    if (contextBranchName && !isFallbackEntityName(contextBranchName)) {
      return contextBranchName.trim();
    }
    if (matchedBranch?.name) return matchedBranch.name;
    if (branchOptions[0]) return branchOptions[0];
    return '—';
  }, [matchedBranch, sessionBranchName, branchOptions, formValues.branch, contextBranchName]);

  const lockedBranchLabel = resolvedBranchLabel;

  const validationSchema = useMemo(
    () => buildCreateUserStepOneSchema(roleCatalog, currentScope),
    [roleCatalog, currentScope],
  );

  const defaultRole = formValues.role || roleOptions[0] || DEFAULT_FALLBACK_ROLES[0] || '';
  const pickCompanyFormValue = (value?: string) =>
    value?.trim() && !isFallbackEntityName(value) ? value.trim() : '';

  const derivedCompanyValue = useMemo(() => {
    if (lockCompanyField || currentScope === 'branch' || currentScope === 'company') {
      if (resolvedCompanyLabel !== '—' && !isFallbackEntityName(resolvedCompanyLabel)) {
        return resolvedCompanyLabel;
      }
      return pickCompanyFormValue(formValues.company);
    }
    return pickCompanyFormValue(formValues.company);
  }, [lockCompanyField, currentScope, resolvedCompanyLabel, formValues.company]);

  const derivedBranchValue = useMemo(() => {
    if (currentScope === 'branch') {
      if (lockedBranchLabel !== '—' && !isFallbackEntityName(lockedBranchLabel)) {
        return lockedBranchLabel;
      }
      return formValues.branch ?? '';
    }
    return formValues.branch ?? '';
  }, [currentScope, lockedBranchLabel, formValues.branch]);

  const syncedFormValues = useMemo(
    (): CreateUserFormValues => ({
      ...formValues,
      role: defaultRole,
      company: derivedCompanyValue,
      branch: derivedBranchValue,
    }),
    [formValues, defaultRole, derivedCompanyValue, derivedBranchValue],
  );

  const { control, handleSubmit, setValue, getValues } = useForm<CreateUserFormValues>({
    resolver: zodResolver(validationSchema),
    values: syncedFormValues,
    resetOptions: { keepDirtyValues: true },
    mode: 'onBlur',
  });

  const handleFieldChange = (field: keyof CreateUserFormValues, value: string | boolean) => {
    if (field === 'company' && typeof value === 'string') {
      setValue('branch', '', { shouldValidate: false });
      updateFormField('branch', '');
    }
    if (field === 'branch' && typeof value === 'string') {
      const trimmedBranch = value.trim().toLowerCase();
      const matchedBranchObj = directory.data?.branches?.find(
        (b) => b.name?.trim().toLowerCase() === trimmedBranch || String(b.id) === trimmedBranch,
      );
      if (matchedBranchObj?.companyName?.trim()) {
        setValue('company', matchedBranchObj.companyName.trim(), {
          shouldValidate: true,
          shouldDirty: true,
        });
        updateFormField('company', matchedBranchObj.companyName.trim());
      }
    }
    setValue(field, value as string, { shouldValidate: true, shouldDirty: true });
    updateFormField(field, value);
    if (field === 'role' && typeof value === 'string') {
      const trimmedVal = value.trim();
      const matched = roleCatalog.find(
        (r) =>
          r.name.toLowerCase() === trimmedVal.toLowerCase() ||
          r.code?.toLowerCase() === trimmedVal.toLowerCase() ||
          String(r.id) === trimmedVal,
      );
      const roleId = matched?.id ?? resolveRoleId(trimmedVal, roleCatalog);
      if (roleId != null) {
        setSelectedRoleId(roleId);
        setRoleAndDescription(matched?.name || value, matched?.description || '', roleId);
      }
    }
  };

  const handleFormSubmit = (data: CreateUserFormValues) => {
    const submitAssignment = resolveRoleAssignmentRequirements(
      data.role,
      roleCatalog,
      currentScope,
    );
    const effectiveRole = data.role || defaultRole;
    const effectiveBranch =
      currentScope === 'branch'
        ? lockedBranchLabel !== '—'
          ? lockedBranchLabel
          : data.branch || branchOptions[0] || ''
        : submitAssignment.requireBranch
          ? data.branch || branchOptions[0] || ''
          : '';

    const branchCandidate = effectiveBranch || data.branch;
    const branchObj = directory.data?.branches?.find(
      (b) =>
        b.name?.trim().toLowerCase() === branchCandidate.trim().toLowerCase() ||
        String(b.id) === branchCandidate.trim(),
    );

    const effectiveCompany =
      branchObj?.companyName?.trim() ||
      (lockCompanyField || currentScope === 'company' || currentScope === 'branch'
        ? resolvedCompanyLabel !== '—'
          ? resolvedCompanyLabel
          : data.company
        : data.company);

    const matched = roleCatalog.find(
      (r) =>
        r.name.toLowerCase() === effectiveRole.toLowerCase() ||
        r.code?.toLowerCase() === effectiveRole.toLowerCase() ||
        String(r.id) === effectiveRole,
    );
    const roleId = matched?.id ?? resolveRoleId(effectiveRole, roleCatalog);
    if (roleId != null) {
      setSelectedRoleId(roleId);
      setRoleAndDescription(matched?.name || effectiveRole, matched?.description || '', roleId);
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

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentVals = getValues();
    const submitAssignment = resolveRoleAssignmentRequirements(
      currentVals.role || defaultRole,
      roleCatalog,
      currentScope,
    );

    const effectiveRole = currentVals.role || defaultRole;
    const effectiveCompany =
      lockCompanyField || currentScope === 'company' || currentScope === 'branch'
        ? resolvedCompanyLabel !== '—'
          ? resolvedCompanyLabel
          : currentVals.company || ''
        : submitAssignment.requireCompany
          ? currentVals.company || (companyOptions[0] ?? '')
          : currentVals.company;

    const effectiveBranch =
      currentScope === 'branch'
        ? lockedBranchLabel !== '—'
          ? lockedBranchLabel
          : currentVals.branch || branchOptions[0] || ''
        : submitAssignment.requireBranch
          ? currentVals.branch || (branchOptions[0] ?? '')
          : currentVals.branch;

    if (effectiveRole !== currentVals.role) {
      setValue('role', effectiveRole, { shouldValidate: false });
    }
    if (effectiveCompany !== currentVals.company && effectiveCompany !== '—') {
      setValue('company', effectiveCompany, { shouldValidate: false });
    }
    if (effectiveBranch !== currentVals.branch && effectiveBranch !== '—') {
      setValue('branch', effectiveBranch, { shouldValidate: false });
    }

    handleSubmit(handleFormSubmit)(e);
  };

  return (
    <Box
      component="form"
      id="create-user-step-one-form"
      noValidate
      onSubmit={onFormSubmit}
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

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
  resolveWizardActiveRoleName,
  type CreateUserFormValues,
  type RoleCatalogItem,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  isBranchAuthenticatedSession,
  isFallbackEntityName,
  resolveCompanyLabelForBranch,
  resolveCreateUserBranchOptions,
  resolveEmployeeDirectoryOptions,
  resolveSessionBranchDisplay,
} from '@/lib/helpers/employees/userRolesHelpers';
import { useEmployeeDirectory, useRoleCatalogQuery } from '@/lib/hooks/employees/user-roles';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { useResolvedBranchName } from '@/lib/hooks/useResolvedBranchName';
import { useSessionBranchCatalog } from '@/lib/hooks/useSessionBranchCatalog';
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
    selectedTemplate,
    selectedRoleId,
    scope: storeScope,
  } = useCreateUserStore();
  const wizardScope = scope || storeScope || 'company';
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id ?? undefined);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const contextOrgId = useSidebarStore((state) => state.context.organizationId);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const accountBranchName = useSidebarStore(
    (state) =>
      (state.account as { branch_name?: string | null } | null | undefined)?.branch_name ??
      undefined,
  );
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const organizationId = contextOrgId ?? accountOrgId;

  const isBranchLogin =
    wizardScope === 'branch' || isBranchAuthenticatedSession({ authScope, accountBranchId });
  const currentScope: ScopeType = isBranchLogin ? 'branch' : wizardScope;

  const directoryQuery = useMemo(
    () =>
      resolveEmployeeDirectoryOptions({
        wizardScope: currentScope,
        contextCompanyId: isBranchLogin ? undefined : contextCompanyId,
        accountCompanyId: isBranchLogin ? undefined : accountCompanyId,
        accountBranchId,
        role,
        authScope,
      }),
    [
      currentScope,
      isBranchLogin,
      contextCompanyId,
      accountCompanyId,
      accountBranchId,
      role,
      authScope,
    ],
  );
  const directoryCompanyId = isBranchLogin ? undefined : directoryQuery.companyId;

  const directory = useEmployeeDirectory(
    isBranchLogin ? undefined : organizationId,
    directoryCompanyId,
    {
      scope: isBranchLogin ? 'branch' : directoryQuery.directoryScope,
      enabled: !isBranchLogin,
    },
  );
  const lockCompanyField = isBranchLogin ? true : directoryQuery.lockCompanyField;

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

  const assignment = useMemo(() => {
    const base = resolveRoleAssignmentRequirements(formValues.role, roleCatalog, currentScope);
    if (!isBranchLogin) return base;
    return {
      ...base,
      showCompany: false,
      requireCompany: false,
      showBranch: true,
      requireBranch: true,
    };
  }, [formValues.role, roleCatalog, currentScope, isBranchLogin]);

  const companyOptions = useMemo(() => {
    const fromDir = (directory.data?.companies ?? [])
      .map((c) => c.name?.trim())
      .filter((name): name is string => Boolean(name && !isFallbackEntityName(name)));
    if (fromDir.length > 0) return fromDir;
    const fromBranches = Array.from(
      new Set(
        (directory.data?.branches ?? [])
          .map((b) => resolveCompanyLabelForBranch(b, directory.data?.companies))
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

  const resolvedCompanyNameHook = useResolvedCompanyName(isBranchLogin ? undefined : companyName, {
    scope: currentScope,
  });
  const resolvedBranchNameHook = useResolvedBranchName(
    isBranchLogin ? undefined : formValues.branch,
    { scope: currentScope },
  );
  const sessionCompanyName = isBranchLogin ? undefined : resolvedCompanyNameHook;
  const branchId = contextBranchId ?? accountBranchId;

  const branchCatalog = useSessionBranchCatalog({ enabled: isBranchLogin });
  const catalogBranchName =
    branchCatalog.activeBranchName ??
    branchCatalog.resolveBranchName(formValues.branch) ??
    branchCatalog.resolveBranchName(branchId);

  const sessionBranchDisplay = useMemo(
    () =>
      resolveSessionBranchDisplay({
        formBranch: formValues.branch,
        contextBranchName,
        accountBranchName,
        catalogBranchName,
      }),
    [formValues.branch, contextBranchName, accountBranchName, catalogBranchName],
  );

  const sessionBranchName = isBranchLogin
    ? sessionBranchDisplay || undefined
    : resolvedBranchNameHook;

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

    const label = resolveCompanyLabelForBranch(targetBranch, companies);
    if (label) {
      return {
        id: targetBranch.companyId,
        name: label,
      };
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
  const isBranchLoading =
    (isBranchLogin &&
      branchCatalog.isLoading &&
      !sessionBranchDisplay &&
      currentScope === 'branch') ||
    (!isBranchLogin && (directory.isFetching || (directory.isLoading && !directory.data)));

  const resolvedBranchLabel = useMemo(() => {
    if (isBranchLogin || currentScope === 'branch') {
      if (sessionBranchDisplay) return sessionBranchDisplay;
    }
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
  }, [
    isBranchLogin,
    currentScope,
    sessionBranchDisplay,
    matchedBranch,
    sessionBranchName,
    branchOptions,
    formValues.branch,
    contextBranchName,
  ]);

  const lockedBranchLabel = resolvedBranchLabel;

  const validationSchema = useMemo(
    () => buildCreateUserStepOneSchema(roleCatalog, currentScope),
    [roleCatalog, currentScope],
  );

  const templateDefaultRole = useMemo(
    () =>
      resolveWizardActiveRoleName({
        formRole: '',
        selectedTemplate,
        selectedRoleId,
        catalog: roleCatalog,
      }),
    [selectedTemplate, selectedRoleId, roleCatalog],
  );
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
    if (isBranchLogin || currentScope === 'branch') {
      if (lockedBranchLabel !== '—' && !isFallbackEntityName(lockedBranchLabel)) {
        return lockedBranchLabel;
      }
      return formValues.branch?.trim() || contextBranchName?.trim() || '';
    }
    return formValues.branch ?? '';
  }, [isBranchLogin, currentScope, lockedBranchLabel, formValues.branch, contextBranchName]);

  const syncedFormValues = useMemo(
    (): CreateUserFormValues => ({
      ...formValues,
      role: formValues.role?.trim() || templateDefaultRole,
      company: derivedCompanyValue,
      branch: derivedBranchValue,
    }),
    [formValues, templateDefaultRole, derivedCompanyValue, derivedBranchValue],
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
      const companyLabel = resolveCompanyLabelForBranch(
        matchedBranchObj,
        directory.data?.companies,
      );
      if (companyLabel) {
        setValue('company', companyLabel, {
          shouldValidate: true,
          shouldDirty: true,
        });
        updateFormField('company', companyLabel);
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
      const nextAssignment = resolveRoleAssignmentRequirements(
        trimmedVal,
        roleCatalog,
        currentScope,
      );
      if (!nextAssignment.requireBranch && !nextAssignment.showBranch) {
        setValue('branch', '', { shouldValidate: true, shouldDirty: true });
        updateFormField('branch', '');
      }
    }
  };

  const handleFormSubmit = (data: CreateUserFormValues) => {
    const submitAssignment = resolveRoleAssignmentRequirements(
      data.role,
      roleCatalog,
      currentScope,
    );
    const effectiveRole = data.role?.trim() || templateDefaultRole;
    const effectiveBranch =
      isBranchLogin || currentScope === 'branch'
        ? lockedBranchLabel !== '—'
          ? lockedBranchLabel
          : data.branch || contextBranchName?.trim() || branchOptions[0] || ''
        : submitAssignment.requireBranch
          ? data.branch || branchOptions[0] || ''
          : '';

    const branchCandidate = effectiveBranch || data.branch;
    const branchObj = isBranchLogin
      ? undefined
      : directory.data?.branches?.find(
          (b) =>
            b.name?.trim().toLowerCase() === branchCandidate.trim().toLowerCase() ||
            String(b.id) === branchCandidate.trim(),
        );

    const branchCompanyLabel = isBranchLogin
      ? ''
      : resolveCompanyLabelForBranch(branchObj, directory.data?.companies);
    const effectiveCompany = isBranchLogin
      ? ''
      : branchCompanyLabel ||
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

    const resolvedSubmitRole =
      resolveWizardActiveRoleName({
        formRole: data.role || effectiveRole,
        selectedTemplate,
        selectedRoleId,
        catalog: roleCatalog,
      }) || effectiveRole;

    const finalValues: CreateUserFormValues = {
      ...data,
      company: effectiveCompany === '—' ? '' : effectiveCompany,
      branch: effectiveBranch === '—' ? '' : effectiveBranch,
      role: resolvedSubmitRole,
    };
    setFormValues(finalValues);
    onValidSubmit?.(finalValues);
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentVals = getValues();
    const submitAssignment = resolveRoleAssignmentRequirements(
      currentVals.role?.trim() || templateDefaultRole,
      roleCatalog,
      currentScope,
    );

    const effectiveRole = currentVals.role?.trim() || templateDefaultRole;
    const effectiveCompany = isBranchLogin
      ? ''
      : lockCompanyField || currentScope === 'company' || currentScope === 'branch'
        ? resolvedCompanyLabel !== '—'
          ? resolvedCompanyLabel
          : currentVals.company || ''
        : submitAssignment.requireCompany
          ? currentVals.company || (companyOptions[0] ?? '')
          : currentVals.company;

    const effectiveBranch =
      isBranchLogin || currentScope === 'branch'
        ? lockedBranchLabel !== '—'
          ? lockedBranchLabel
          : currentVals.branch || contextBranchName?.trim() || branchOptions[0] || ''
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

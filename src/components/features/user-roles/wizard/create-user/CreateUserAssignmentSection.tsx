'use client';

import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';
import type {
  CreateUserFormValues,
  RoleAssignmentRequirements,
  ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface CreateUserAssignmentSectionProps {
  control: Control<CreateUserFormValues>;
  currentScope: ScopeType;
  assignment: RoleAssignmentRequirements;
  companyOptions: string[];
  branchOptions: string[];
  roleOptions: string[];
  lockedCompanyLabel: string;
  lockCompanyField?: boolean;
  lockedBranchLabel: string;
  isBranchLoading: boolean;
  onFieldChange: (field: keyof CreateUserFormValues, value: string | boolean) => void;
}

const ASSIGNMENT_CONTROL_HEIGHT = 40;
/** Control + reserved validation line — keeps assign columns aligned when some fields are locked. */
const ASSIGNMENT_CONTROL_BLOCK_MIN_HEIGHT = ASSIGNMENT_CONTROL_HEIGHT + 4 + 18;

const assignmentGridGap = {
  columnGap: { xs: 2, md: 3 },
  rowGap: 3,
  alignItems: 'start',
} as const;

const assignmentColumnSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  width: '100%',
} as const;

const assignmentHeaderBlockSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  minHeight: '2.875rem',
  mb: 1,
} as const;

const assignmentControlBlockSx = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: ASSIGNMENT_CONTROL_BLOCK_MIN_HEIGHT,
  mb: 1,
} as const;

const assignmentHeadingSx = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'text.primary',
  lineHeight: 1.25,
  minHeight: '1.25rem',
} as const;

const assignmentLabelSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: colors.text.secondary,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  lineHeight: 1.3,
  minHeight: '1.125rem',
} as const;

const assignmentHelperSx = {
  fontSize: '0.75rem',
  color: colors.text.secondary,
  mt: 0.25,
  lineHeight: 1.45,
  minHeight: '2.625rem',
} as const;

const assignmentDropdownSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: ASSIGNMENT_CONTROL_HEIGHT,
    borderRadius: '8px',
  },
} as const;

const lockedFieldSx = {
  height: ASSIGNMENT_CONTROL_HEIGHT,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: (theme: { palette: { mode: string; divider: string } }) =>
    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
  bgcolor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.surface.muted,
  px: 1.75,
  display: 'flex',
  alignItems: 'center',
  color: 'text.primary',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'default',
  userSelect: 'none',
} as const;

function assignmentGridColumns(columnCount: number) {
  const capped = Math.min(Math.max(columnCount, 1), 3);
  return {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: capped === 1 ? '1fr' : `repeat(${capped}, minmax(0, 1fr))`,
    },
    ...assignmentGridGap,
  };
}

function AssignmentColumnHeader({
  title,
  label,
  required = false,
}: Readonly<{ title: string; label: string; required?: boolean }>) {
  return (
    <Box sx={assignmentHeaderBlockSx}>
      <Typography sx={assignmentHeadingSx}>{title}</Typography>
      <Typography
        component="div"
        sx={{
          ...assignmentLabelSx,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 0.625rem',
          alignItems: 'center',
          columnGap: 0.25,
        }}
      >
        <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </Box>
        <Box
          component="span"
          sx={{
            color: required ? 'error.main' : 'transparent',
            textAlign: 'center',
            lineHeight: 1,
          }}
          aria-hidden={!required}
        >
          *
        </Box>
      </Typography>
    </Box>
  );
}

function AssignmentControlBlock({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Box sx={assignmentControlBlockSx}>{children}</Box>;
}

function AssignmentFieldError({ message }: Readonly<{ message?: string }>) {
  return (
    <Typography
      sx={{
        fontSize: '0.75rem',
        color: message ? 'error.main' : 'transparent',
        mt: 0.5,
        minHeight: '1.125rem',
        lineHeight: '1.125rem',
      }}
      aria-hidden={!message}
    >
      {message || '\u00a0'}
    </Typography>
  );
}

export function CreateUserAssignmentSection({
  control,
  currentScope,
  assignment,
  companyOptions,
  branchOptions,
  roleOptions,
  lockedCompanyLabel,
  lockCompanyField = false,
  lockedBranchLabel,
  isBranchLoading,
  onFieldChange,
}: Readonly<CreateUserAssignmentSectionProps>) {
  const showCompanyField = assignment.showCompany || currentScope === 'company';
  const showBranchField = assignment.showBranch || currentScope === 'branch';

  const companyHelper =
    currentScope === 'branch'
      ? 'The user belongs to this company organization.'
      : assignment.roleScope === 'company'
        ? 'The user operates at company level across all branches.'
        : 'Choose which company this user belongs to.';

  const assignmentColumnCount = (showCompanyField ? 1 : 0) + (showBranchField ? 1 : 0) + 1;

  return (
    <Box sx={assignmentGridColumns(assignmentColumnCount)}>
      {showCompanyField ? (
        <Box sx={assignmentColumnSx}>
          <AssignmentColumnHeader
            title="Assign Company"
            label="SELECT COMPANY"
            required={assignment.requireCompany && !lockCompanyField}
          />
          <AssignmentControlBlock>
            {!lockCompanyField ? (
              <Controller
                name="company"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Dropdown
                      options={companyOptions}
                      value={field.value?.trim() ? field.value : ''}
                      onChange={(val) => onFieldChange('company', val)}
                      placeholder={
                        companyOptions.length === 0 ? 'No companies available' : 'Select company'
                      }
                      sx={assignmentDropdownSx}
                    />
                    <AssignmentFieldError message={fieldState.error?.message} />
                  </>
                )}
              />
            ) : (
              <>
                <Box sx={lockedFieldSx}>{lockedCompanyLabel}</Box>
                <AssignmentFieldError />
              </>
            )}
          </AssignmentControlBlock>
          <Typography sx={assignmentHelperSx}>{companyHelper}</Typography>
        </Box>
      ) : null}

      {showBranchField ? (
        <Box sx={assignmentColumnSx}>
          <AssignmentColumnHeader
            title="Assign Branch"
            label="SELECT BRANCH"
            required={assignment.requireBranch && currentScope !== 'branch'}
          />
          <AssignmentControlBlock>
            {isBranchLoading ? (
              <>
                <Box
                  sx={{
                    ...lockedFieldSx,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : colors.surface.muted,
                    gap: 1.25,
                    fontWeight: 500,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                  <Typography
                    sx={{ fontSize: '0.875rem', color: colors.text.secondary, fontWeight: 500 }}
                  >
                    {currentScope === 'branch' ? 'Loading branch...' : 'Loading branches...'}
                  </Typography>
                </Box>
                <AssignmentFieldError />
              </>
            ) : null}
            {!isBranchLoading && currentScope === 'branch' ? (
              <>
                <Box sx={lockedFieldSx}>{lockedBranchLabel}</Box>
                <AssignmentFieldError />
              </>
            ) : null}
            {!isBranchLoading && currentScope !== 'branch' ? (
              <Controller
                name="branch"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <Dropdown
                      options={branchOptions}
                      value={field.value?.trim() ? field.value : ''}
                      onChange={(val) => onFieldChange('branch', val)}
                      placeholder={
                        branchOptions.length === 0 ? 'No branches available' : 'Select branch'
                      }
                      sx={assignmentDropdownSx}
                    />
                    <AssignmentFieldError message={fieldState.error?.message} />
                  </>
                )}
              />
            ) : null}
          </AssignmentControlBlock>
          <Typography sx={assignmentHelperSx}>
            The user will only see data for the selected branch.
          </Typography>
        </Box>
      ) : null}

      <Box sx={assignmentColumnSx}>
        <AssignmentColumnHeader title="Assign Role" label="SELECT ROLE" required />
        <AssignmentControlBlock>
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Dropdown
                  options={roleOptions}
                  value={field.value?.trim() ? field.value : ''}
                  onChange={(val) => onFieldChange('role', val)}
                  placeholder="Select role"
                  sx={assignmentDropdownSx}
                />
                <AssignmentFieldError message={fieldState.error?.message} />
              </>
            )}
          />
        </AssignmentControlBlock>
        <Typography sx={assignmentHelperSx}>
          Role defines permissions and data scope for this user.
        </Typography>
      </Box>
    </Box>
  );
}

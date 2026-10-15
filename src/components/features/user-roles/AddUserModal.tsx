'use client';

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/shared/ui/Modal';
import { Input } from '@/components/shared/form-fields/Input';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { userRoleFormSchema, type UserRoleFormValues } from '@/lib/schemas/user-roles';
import {
  ROLE_OPTIONS,
  BRANCH_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/mocks/employees/useUserRoles.mocks';
import type { UserRoleItem } from '@/types/user-roles';

export interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UserRoleFormValues) => void;
  editUser?: UserRoleItem | null;
  roleOptions?: readonly string[];
  branchOptions?: readonly string[];
}

export function AddUserModal({
  open,
  onClose,
  onSubmit,
  editUser,
  roleOptions = ROLE_OPTIONS,
  branchOptions = BRANCH_OPTIONS,
}: Readonly<AddUserModalProps>) {
  const isEditing = Boolean(editUser);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserRoleFormValues>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: roleOptions[0] || ROLE_OPTIONS[0],
      branch: branchOptions[0] || BRANCH_OPTIONS[0],
      status: 'active',
    },
  });

  useEffect(() => {
    if (editUser) {
      reset({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        branch: editUser.branch,
        status: editUser.status,
      });
    } else {
      reset({
        name: '',
        email: '',
        role: roleOptions[0] || ROLE_OPTIONS[0],
        branch: branchOptions[0] || BRANCH_OPTIONS[0],
        status: 'active',
      });
    }
  }, [editUser, reset, open, roleOptions, branchOptions]);

  const onFormSubmit = (data: UserRoleFormValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit User' : 'Add New User'}
      subtitle={
        isEditing
          ? 'Update team member information and access level.'
          : 'Invite a team member and assign their role and branch.'
      }
      width={560}
      height="auto"
      padding={28}
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%', pt: 1 }}>
          <ActionButton variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleSubmit(onFormSubmit)}
            loading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Add User'}
          </ActionButton>
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onFormSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        {/* Full Name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Full Name"
              required
              placeholder="e.g. Marcus Wright"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        {/* Email Address */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              label="Email Address"
              required
              type="email"
              placeholder="e.g. m.marcus@hospixo.com"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        {/* Role Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            Role{' '}
            <Box component="span" sx={{ color: 'error.main' }}>
              *
            </Box>
          </Typography>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={roleOptions}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                sx={{ width: '100%' }}
              />
            )}
          />
          {errors.role && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {errors.role.message}
            </Typography>
          )}
        </Box>

        {/* Branch Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            Branch{' '}
            <Box component="span" sx={{ color: 'error.main' }}>
              *
            </Box>
          </Typography>
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={branchOptions}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                sx={{ width: '100%' }}
              />
            )}
          />
          {errors.branch && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {errors.branch.message}
            </Typography>
          )}
        </Box>

        {/* Status Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            Status
          </Typography>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                sx={{ width: '100%' }}
              />
            )}
          />
          {errors.status && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {errors.status.message}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

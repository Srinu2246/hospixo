'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Modal } from '@/components/shared/ui/Modal';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface StaffProfileStatusModalsProps {
  userName: string;
  isDeactivateModalOpen: boolean;
  isActivateModalOpen: boolean;
  isDeactivating: boolean;
  isActivating: boolean;
  onCloseDeactivate: () => void;
  onCloseActivate: () => void;
  onConfirmDeactivate: () => void;
  onConfirmActivate: () => void;
}

export function StaffProfileStatusModals({
  userName,
  isDeactivateModalOpen,
  isActivateModalOpen,
  isDeactivating,
  isActivating,
  onCloseDeactivate,
  onCloseActivate,
  onConfirmDeactivate,
  onConfirmActivate,
}: Readonly<StaffProfileStatusModalsProps>) {
  return (
    <>
      {/* Confirmation Modal for Staff Inactivation */}
      <Modal
        open={isDeactivateModalOpen}
        onClose={onCloseDeactivate}
        title="Inactivate Staff Member"
        subtitle={`Are you sure you want to inactivate ${userName}?`}
        width={480}
        height="auto"
        padding={24}
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
            <ActionButton variant="outlined" onClick={onCloseDeactivate} disabled={isDeactivating}>
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              loading={isDeactivating}
              onClick={onConfirmDeactivate}
              sx={{
                bgcolor: colors.danger.default,
                '&:hover': { bgcolor: colors.danger.dark },
              }}
            >
              Confirm Inactivation
            </ActionButton>
          </Box>
        }
      >
        <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
          Inactivating this user will revoke their system access immediately. Their historical
          records and logs will remain preserved, but they will no longer be able to log in.
        </Typography>
      </Modal>

      {/* Confirmation Modal for Staff Activation */}
      <Modal
        open={isActivateModalOpen}
        onClose={onCloseActivate}
        title="Activate Staff Member"
        subtitle={`Are you sure you want to activate ${userName}?`}
        width={480}
        height="auto"
        padding={24}
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
            <ActionButton variant="outlined" onClick={onCloseActivate} disabled={isActivating}>
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              loading={isActivating}
              onClick={onConfirmActivate}
              sx={{
                bgcolor: '#15803D',
                '&:hover': { bgcolor: '#166534' },
              }}
            >
              Confirm Activation
            </ActionButton>
          </Box>
        }
      >
        <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
          Activating this user will restore their system access immediately. They will be able to
          log in and perform operations according to their assigned role.
        </Typography>
      </Modal>
    </>
  );
}

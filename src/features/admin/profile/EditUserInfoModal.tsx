'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCircle, Mail, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Modal } from '@/components/shared/ui/Modal';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  EditUserInfoValues,
  PhoneEntry,
  UserProfile,
} from '@/lib/schemas/admin/profile/adminProfileSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface EditUserInfoModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: EditUserInfoValues) => void;
  onChangeEmailRequest?: () => void;
}

/**
 * Edit User Info Modal
 *
 * Matches the design reference:
 * - Info alert banner
 * - Editable Name input
 * - Read-only verified Email input with Change Email action
 * - Linked mobile numbers table with Add phone number action and Delete action
 */
export function EditUserInfoModal({
  open,
  onClose,
  profile,
  onSave,
  onChangeEmailRequest,
}: Readonly<EditUserInfoModalProps>) {
  const [name, setName] = useState(profile.name);
  const [phones, setPhones] = useState<PhoneEntry[]>(profile.mobileNumbers);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function handleStartAddPhone() {
    setIsAddingPhone(true);
    setNewPhoneInput('');
    setPhoneError(null);
  }

  function handleCancelAddPhone() {
    setIsAddingPhone(false);
    setNewPhoneInput('');
    setPhoneError(null);
  }

  function handleConfirmAddPhone() {
    const trimmed = newPhoneInput.trim();
    if (trimmed.length < 5) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    const newEntry: PhoneEntry = {
      id: `phone-${Date.now()}`,
      number: trimmed,
      verified: true,
    };
    setPhones([...phones, newEntry]);
    setIsAddingPhone(false);
    setNewPhoneInput('');
    setPhoneError(null);
  }

  function handleDeletePhone(id: string) {
    if (phones.length <= 1) return;
    setPhones(phones.filter((p) => p.id !== id));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      email: profile.email,
      mobileNumbers: phones,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User info"
      width={520}
      height="auto"
      padding={24}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="text" onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" onClick={handleSave} disabled={!name.trim()}>
            Save
          </ActionButton>
        </Stack>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Top Info Banner */}
        <AlertMessage
          variant="info"
          message="Important: Please Save Your Changes Before You Leave."
          sx={{ width: '100%' }}
        />

        {/* Name Field */}
        <Input
          label="Name"
          required
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email Field with Verified Status */}
        <Box>
          <Input
            label="Email"
            required
            value={profile.email}
            disabled
            startIcon={<Mail size={16} />}
          />
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.75,
              px: 0.5,
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <CheckCircle size={14} color={colors.success.default} />
              <Typography
                sx={{ fontSize: '0.75rem', color: colors.success.default, fontWeight: 500 }}
              >
                Verified
              </Typography>
            </Stack>
            <Typography
              component="button"
              type="button"
              onClick={onChangeEmailRequest}
              sx={{
                fontSize: '0.75rem',
                color: 'primary.main',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                bgcolor: 'transparent',
                p: 0,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Change Email
            </Typography>
          </Stack>
        </Box>

        {/* Linked Mobile Numbers Section */}
        <Box>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              Linked mobile numbers
            </Typography>
            <Typography
              component="button"
              type="button"
              onClick={handleStartAddPhone}
              sx={{
                fontSize: '0.8125rem',
                color: 'primary.main',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                bgcolor: 'transparent',
                p: 0,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              + Add phone number
            </Typography>
          </Stack>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(241, 245, 249, 0.7)',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                Mobile number
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                Action
              </Typography>
            </Stack>

            {/* List Rows */}
            {phones.map((phone) => (
              <Stack
                key={phone.id}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: isAddingPhone ? '1px solid' : 'none',
                    borderColor: 'divider',
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary' }}
                  >
                    {phone.number}
                  </Typography>
                  {phone.verified ? (
                    <StatusChip variantType="success" label="Verified" size="small" />
                  ) : null}
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleDeletePhone(phone.id)}
                  disabled={phones.length <= 1}
                  aria-label="Delete mobile number"
                  sx={{
                    color: 'text.secondary',
                    p: 0.5,
                    '&:hover': { color: colors.danger.default },
                    '&.Mui-disabled': { opacity: 0.3 },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Stack>
            ))}

            {/* Inline Add Phone Field */}
            {isAddingPhone ? (
              <Box sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Input
                    placeholder="e.g. +91 9876543210"
                    value={newPhoneInput}
                    onChange={(e) => {
                      setNewPhoneInput(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    error={Boolean(phoneError)}
                    helperText={phoneError ?? undefined}
                    sx={{ flex: 1 }}
                  />
                  <ActionButton size="small" variant="primary" onClick={handleConfirmAddPhone}>
                    Add
                  </ActionButton>
                  <ActionButton size="small" variant="text" onClick={handleCancelAddPhone}>
                    Cancel
                  </ActionButton>
                </Stack>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

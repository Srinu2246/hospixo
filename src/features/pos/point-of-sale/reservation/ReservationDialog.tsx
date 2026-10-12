'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Moon, Sun, Sunrise } from 'lucide-react';
import ActionButton from '@/components/shared/form-fields/ActionButton';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import { Modal } from '@/components/shared/ui/Modal';
import { TabItem, Tabs } from '@/components/shared/form-fields/Tabs';
import { Input } from '@/components/shared/form-fields/Input';
import { colors } from '@/lib/theme/mui/colors';

export interface NewReservationFormData {
  guest: string; // Full name of the guest
  phone: string; // Contact phone number with country code
  email?: string; // Email address
  specialRequests?: string; // Dietary / seating requests
  guestCount: number; // Number of reserved guests
  date: string; // Selected date string
  time: string; // Selected reservation time string
  mealPeriod: 'breakfast' | 'lunch' | 'dinner'; // Meal period category
}

export interface NewReservationDialogProps {
  open: boolean; // Dialog visibility flag
  onClose: () => void; // Close handler
  onConfirm?: (data: NewReservationFormData) => void; // Confirmation callback
  initialData?: Partial<NewReservationFormData>; // Prefill data when editing
  title?: string; // Modal title override (default: 'Reserve a Table')
}

// Available guest count options from 1 to 10
const GUEST_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Date options matching the design
const DATE_OPTIONS = [
  { label: 'Today', date: '01 Sep', fullDate: '2024-09-01' },
  { label: 'Wed', date: '02 Sep', fullDate: '2024-09-02' },
  { label: 'Thu', date: '03 Sep', fullDate: '2024-09-03' },
  { label: 'Fri', date: '04 Sep', fullDate: '2024-09-04' },
  { label: 'Sat', date: '05 Sep', fullDate: '2024-09-05' },
  { label: 'Sun', date: '06 Sep', fullDate: '2024-09-06' },
  { label: 'Mon', date: '07 Sep', fullDate: '2024-09-07' },
  { label: 'Tue', date: '08 Sep', fullDate: '2024-09-08' },
];

// Meal period tabs configuration
const MEAL_TABS: TabItem[] = [
  {
    value: 'breakfast',
    label: 'Breakfast',
    icon: <Sunrise size={18} color={colors.primary.default} />,
  },
  {
    value: 'lunch',
    label: 'Lunch',
    icon: <Sun size={18} color={colors.warning.default} />,
  },
  {
    value: 'dinner',
    label: 'Dinner',
    icon: <Moon size={18} color={colors.secondary.light} />,
  },
];

// Time slot offerings per meal period
const TIME_SLOTS: Record<'breakfast' | 'lunch' | 'dinner', string[]> = {
  breakfast: [
    '08:00 AM',
    '08:15 AM',
    '08:30 AM',
    '08:45 AM',
    '09:00 AM',
    '09:15 AM',
    '09:30 AM',
    '09:45 AM',
    '10:00 AM',
    '10:15 AM',
    '10:30 AM',
    '10:45 AM',
    '11:00 AM',
    '11:15 AM',
    '11:30 AM',
    '11:45 AM',
  ],
  lunch: [
    '12:00 PM',
    '12:15 PM',
    '12:30 PM',
    '12:45 PM',
    '01:00 PM',
    '01:15 PM',
    '01:30 PM',
    '01:45 PM',
    '02:00 PM',
    '02:15 PM',
    '02:30 PM',
    '02:45 PM',
  ],
  dinner: [
    '06:00 PM',
    '06:15 PM',
    '06:30 PM',
    '06:45 PM',
    '07:00 PM',
    '07:15 PM',
    '07:30 PM',
    '07:45 PM',
    '08:00 PM',
    '08:15 PM',
    '08:30 PM',
    '08:45 PM',
    '09:00 PM',
    '09:15 PM',
  ],
};

// Modal dialog for reserving a table with guest details, date, and slot selection
export function ReservationDialog({
  open,
  onClose,
  onConfirm,
  initialData,
  title = 'Reserve a Table',
}: Readonly<NewReservationDialogProps>) {
  // Form input states
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Selection states
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState<string>('02 Sep');
  const [mealPeriod, setMealPeriod] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [selectedTime, setSelectedTime] = useState<string>('09:15 AM');

  // Validation state
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Reset form to defaults or initial prefill data
  const resetForm = () => {
    if (initialData) {
      setFullName(initialData.guest ?? '');
      if (initialData.phone) {
        const parts = initialData.phone.split(' ');
        if (parts.length > 1 && parts[0].startsWith('+')) {
          setCountryCode(parts[0]);
          setPhoneNumber(parts.slice(1).join(' '));
        } else {
          setCountryCode('+91');
          setPhoneNumber(initialData.phone);
        }
      } else {
        setPhoneNumber('');
      }
      setEmailId(initialData.email ?? '');
      setSpecialRequests(initialData.specialRequests ?? '');
      setGuestCount(initialData.guestCount ?? 2);
      setSelectedDate(initialData.date ?? '02 Sep');
      setMealPeriod(initialData.mealPeriod ?? 'lunch');
      setSelectedTime(initialData.time ?? '12:00 PM');
    } else {
      setFullName('');
      setCountryCode('+91');
      setPhoneNumber('');
      setEmailId('');
      setSpecialRequests('');
      setGuestCount(2);
      setSelectedDate('02 Sep');
      setMealPeriod('breakfast');
      setSelectedTime('09:15 AM');
    }
    setErrors({});
  };

  // Synchronize prefill values whenever dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, initialData]);

  // Handle dialog close with reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit and confirm reservation
  const handleConfirm = () => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!phoneNumber.trim()) {
      newErrors.phone = 'Phone Number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm?.({
      guest: fullName.trim(),
      phone: `${countryCode} ${phoneNumber.trim()}`,
      email: emailId.trim() || undefined,
      specialRequests: specialRequests.trim() || undefined,
      guestCount,
      date: selectedDate,
      time: selectedTime,
      mealPeriod,
    });

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onBack={handleClose}
      title={title}
      width={660}
      height={868}
      padding={24}
      gap={20}
      footer={
        <ActionButton
          variant="primary"
          fullWidth
          onClick={handleConfirm}
          sx={{
            height: 48,
            borderRadius: '10px',
            bgcolor: colors.primary.default,
            color: colors.white.default,
            fontWeight: 600,
            fontSize: '0.9375rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
              boxShadow: 'none',
            },
          }}
        >
          Confirm Reservation
        </ActionButton>
      }
    >
      {/* Row 1: Full Name, Phone Number, Email ID */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1.15fr 1fr' },
          gap: 1.75,
          alignItems: 'flex-start',
        }}
      >
        <Input
          label="Full Name"
          required
          placeholder="Jonathan"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName}
        />

        <MobileNumberInput
          label="Phone Number"
          required
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={(val) => {
            setPhoneNumber(val);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          placeholder="999 777 6767"
          error={Boolean(errors.phone)}
          helperText={errors.phone}
        />

        <Input
          label="Email ID"
          placeholder="abcd@gmail.com"
          type="email"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
        />
      </Box>

      {/* Row 2: Special Requests */}
      <Input
        label="Special Requests"
        placeholder="e.g., High chair, wheelchair accessible, anniversary setup..."
        value={specialRequests}
        onChange={(e) => setSpecialRequests(e.target.value)}
      />

      {/* Row 3: Number of guest(s) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
          Number of guest(s)
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {GUEST_COUNT_OPTIONS.map((count) => {
            const isSelected = guestCount === count;

            return (
              <ActionButton
                key={count}
                variant="outlined"
                onClick={() => setGuestCount(count)}
                sx={{
                  flex: 1,
                  minWidth: 44,
                  height: 44,
                  p: 0,
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  borderColor: isSelected ? colors.primary.default : 'divider',
                  bgcolor: isSelected ? alpha(colors.primary.default, 0.08) : 'background.paper',
                  color: isSelected ? colors.primary.default : 'text.primary',
                  borderWidth: isSelected ? '1.5px' : '1px',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: isSelected ? colors.primary.default : 'text.disabled',
                    bgcolor: isSelected ? alpha(colors.primary.default, 0.14) : 'action.hover',
                  },
                }}
              >
                {count}
              </ActionButton>
            );
          })}
        </Box>
      </Box>

      {/* Row 4: When are you visiting? */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
          When are you visiting?
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {DATE_OPTIONS.map((item) => {
            const isSelected = selectedDate === item.date;

            return (
              <ActionButton
                key={item.date}
                variant="outlined"
                onClick={() => setSelectedDate(item.date)}
                sx={{
                  flex: 1,
                  minWidth: 64,
                  height: 52,
                  px: 0.75,
                  py: 0.5,
                  borderRadius: '10px',
                  borderColor: isSelected ? colors.primary.default : 'divider',
                  bgcolor: isSelected ? alpha(colors.primary.default, 0.08) : 'background.paper',
                  color: isSelected ? colors.primary.default : 'text.primary',
                  borderWidth: isSelected ? '1.5px' : '1px',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.25,
                  '&:hover': {
                    borderColor: isSelected ? colors.primary.default : 'text.disabled',
                    bgcolor: isSelected ? alpha(colors.primary.default, 0.14) : 'action.hover',
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    lineHeight: 1,
                    color: isSelected ? colors.primary.default : 'text.secondary',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: isSelected ? colors.primary.default : 'text.primary',
                  }}
                >
                  {item.date}
                </Typography>
              </ActionButton>
            );
          })}
        </Box>
      </Box>

      {/* Row 5: Select the time of day to see the offers */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
          Select the time of day to see the offers
        </Typography>

        {/* Meal Container Card */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Meal Period Tabs */}
          <Tabs
            tabs={MEAL_TABS}
            value={mealPeriod}
            onChange={(val) => {
              const typedMeal = val as 'breakfast' | 'lunch' | 'dinner';
              setMealPeriod(typedMeal);
              const availableSlots = TIME_SLOTS[typedMeal];
              if (!availableSlots.includes(selectedTime)) {
                setSelectedTime(availableSlots[0] || '12:00 PM');
              }
            }}
          />

          {/* Time Slot Grid */}
          <Box
            sx={{
              p: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
              gap: 1.25,
            }}
          >
            {TIME_SLOTS[mealPeriod].map((timeSlot) => {
              const isSelected = selectedTime === timeSlot;

              return (
                <ActionButton
                  key={timeSlot}
                  variant="outlined"
                  onClick={() => setSelectedTime(timeSlot)}
                  sx={{
                    height: 40,
                    borderRadius: '8px',
                    borderColor: isSelected ? colors.primary.default : 'divider',
                    bgcolor: isSelected ? alpha(colors.primary.default, 0.08) : 'background.paper',
                    color: isSelected ? colors.primary.default : 'text.primary',
                    fontWeight: isSelected ? 700 : 600,
                    fontSize: '0.8125rem',
                    borderWidth: isSelected ? '1.5px' : '1px',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: isSelected ? colors.primary.default : 'text.disabled',
                      bgcolor: isSelected ? alpha(colors.primary.default, 0.14) : 'action.hover',
                    },
                  }}
                >
                  {timeSlot}
                </ActionButton>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

import {
  userProfileSchema,
  type UserProfile,
} from '@/lib/schemas/admin/profile/adminProfileSchema';

export const MOCK_ADMIN_PROFILE: UserProfile = userProfileSchema.parse({
  id: 'usr-admin-1',
  name: 'Ravi kumar',
  email: 'helloworld@gmail.com',
  mobileNumbers: [
    {
      id: 'ph-1',
      number: '+91 9934309000',
      verified: true,
    },
  ],
  twoFactorLogin: true,
  twoFactorProtection: true,
});

export type VerifiedMobileNumber = Readonly<{
  id: string;
  number: string;
  verified: boolean;
}>;

export type UserProfile = Readonly<{
  name: string;
  email: string;
  mobileNumbers: readonly VerifiedMobileNumber[];
  twoFactorEnabled: boolean;
  roleLabel: string;
}>;

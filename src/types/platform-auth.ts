export type BusinessType = 'hotel' | 'bar' | 'club' | 'restaurant' | 'hybrid';

export type TokenUserInfo = Readonly<{
  id: number;
  first_name: string;
  last_name: string | null;
  email: string | null;
  scope: string;
  roles: readonly string[];
  company_id: number | null;
  branch_id: number | null;
  org_id: number;
  /** When true, user must change password before accessing protected resources. */
  must_change_password?: boolean;
}>;

export type AuthToken = Readonly<{
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: TokenUserInfo;
}>;

export type AuthSession = Readonly<{
  accessToken: string;
  expiresIn: number;
  user: TokenUserInfo;
}>;

export type LoginInput = Readonly<{
  email: string;
  password: string;
  domain: string;
}>;

export type PlatformLoginInput = Readonly<{
  email: string;
  password: string;
}>;

export type PinLoginInput = Readonly<{
  quick_pin: string;
  branch_id: number;
}>;

export type RegisterInput = Readonly<{
  domain: string;
  brand_name: string;
  business_name: string;
  business_type: BusinessType;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  password: string;
  consent_terms: boolean;
  consent_privacy: boolean;
}>;

export type RegistrationResult = Readonly<{
  user_id: number;
  email: string;
  organization_id: number;
  company_id: number;
  access_token: string;
  token_type: string;
  expires_in: number;
}>;

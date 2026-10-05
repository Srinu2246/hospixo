export type PlatformLoginFieldErrors = Readonly<{
  email?: string;
  password?: string;
  domain?: string;
}>;

export type PlatformLoginState = Readonly<{
  error?: string;
  fieldErrors?: PlatformLoginFieldErrors;
  values?: { email?: string; domain?: string };
}>;

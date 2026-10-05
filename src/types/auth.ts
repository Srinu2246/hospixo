export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  values?: { email?: string };
};

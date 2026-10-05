'use client';

import dynamic from 'next/dynamic';

import { AuthPageLoading } from '@/features/auth/components/AuthPageLoading';

export const LoginForm = dynamic(
  () => import('@/features/auth/components/forms/LoginForm').then((mod) => mod.LoginForm),
  {
    ssr: false,
    loading: () => <AuthPageLoading />,
  },
);

export const PinLoginForm = dynamic(
  () => import('@/features/auth/components/forms/PinLoginForm').then((mod) => mod.PinLoginForm),
  {
    ssr: false,
    loading: () => <AuthPageLoading />,
  },
);

export const OtpLoginForm = dynamic(
  () => import('@/features/auth/components/forms/OtpLoginForm').then((mod) => mod.OtpLoginForm),
  {
    ssr: false,
    loading: () => <AuthPageLoading />,
  },
);

export const ForgotPasswordForm = dynamic(
  () =>
    import('@/features/auth/components/forms/ForgotPasswordForm').then(
      (mod) => mod.ForgotPasswordForm,
    ),
  {
    ssr: false,
    loading: () => <AuthPageLoading />,
  },
);

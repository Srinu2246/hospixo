import { redirect } from 'next/navigation';

import { AUTH_ROUTES } from '@/lib/constants/routes';

/** App entry opens the login screen (matches Hospixo platform). */
export default function HomePage() {
  redirect(AUTH_ROUTES.login);
}

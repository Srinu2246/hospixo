import Image from 'next/image';
import Link from 'next/link';

import { AUTH_ROUTES } from '@/constants/routes';
import { siteConfig } from '@/constants/site';

import layoutStyles from '@/features/auth/components/login-split-layout.module.css';

type AuthLogoProps = Readonly<{
  priority?: boolean;
}>;

export function AuthLogo({ priority = false }: AuthLogoProps) {
  const { width, height } = siteConfig.brand.logoDimensions;

  return (
    <Link
      href={AUTH_ROUTES.login}
      className={layoutStyles['login-split__logo']}
      aria-label={siteConfig.name}
    >
      <Image
        src={siteConfig.brand.logoLight}
        alt=""
        width={width}
        height={height}
        priority={priority}
      />
    </Link>
  );
}

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { AuthThemeToggle } from '@/components/auth/AuthThemeToggle';
import { AuthLogo } from '@/components/common/brand/AuthLogo';
import { authPromoContent } from '@/features/auth/config/promo';

import styles from './login-split-layout.module.css';

type AuthSplitLayoutProps = Readonly<{
  children: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
  cardClassName?: string;
}>;

/** Platform tenant auth shell — mirrors `apps/platform` login split layout. */
export function AuthSplitLayout({
  children,
  title,
  description,
  footer,
  cardClassName,
}: AuthSplitLayoutProps) {
  const promo = authPromoContent;
  const formCardClassName = [styles['login-split__form-card'], cardClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['login-split']}>
      <AuthThemeToggle />
      <aside className={styles['login-split__promo']} aria-hidden>
        <div className={styles['login-split__promo-inner']}>
          <AuthLogo priority />
          <div className={styles['login-split__promo-copy']}>
            <h1 className={styles['login-split__promo-heading']}>{promo.heading}</h1>
            <p className={styles['login-split__promo-description']}>{promo.description}</p>
          </div>
          <ul className={styles['login-split__features']}>
            {promo.features.map((feature) => (
              <li key={feature.id} className={styles['login-split__feature']}>
                <span className={styles['login-split__feature-icon']} aria-hidden>
                  <Check className={styles['login-split__feature-icon-svg']} />
                </span>
                <div>
                  <p className={styles['login-split__feature-title']}>{feature.title}</p>
                  <p className={styles['login-split__feature-description']}>
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles['login-split__promo-footnote']}>{promo.footnote}</p>
        </div>
      </aside>
      <section className={styles['login-split__form-panel']} aria-labelledby="auth-form-heading">
        <div className={formCardClassName}>
          <div className={styles['login-split__form-header']}>
            <h2 id="auth-form-heading" className={styles['login-split__form-title']}>
              {title}
            </h2>
            <p className={styles['login-split__form-description']}>{description}</p>
          </div>
          {children}
          {footer ? <div className={styles['login-split__form-footer']}>{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}

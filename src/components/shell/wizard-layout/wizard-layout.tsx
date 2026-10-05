import type { ReactNode } from 'react';

import styles from './wizard-layout.module.css';

type WizardLayoutProps = Readonly<{
  title: string;
  subtitle?: string;
  cardTitle?: string;
  stepper?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  hideCard?: boolean;
}>;

export function WizardLayout({
  title,
  subtitle,
  cardTitle,
  stepper,
  footer,
  children,
  hideCard = false,
}: WizardLayoutProps) {
  return (
    <div>
      {title ? (
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
      ) : subtitle ? (
        <header className={styles.pageHeader}>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
      ) : null}

      {stepper}

      {hideCard ? (
        children
      ) : (
        <section className={styles.card}>
          {cardTitle ? (
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{cardTitle}</h2>
            </div>
          ) : null}
          <div className={styles.cardBody}>{children}</div>
          {footer ? <div className={styles.cardFooter}>{footer}</div> : null}
        </section>
      )}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { closingPageMeta } from '@/features/pos/day-close/config/closing';

import styles from './closing-page.module.css';

export function ClosingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(closingPageMeta.redirectHref);
    }, closingPageMeta.redirectDelayMs);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} aria-hidden />
      <h1 className={styles.title}>{closingPageMeta.title}</h1>
      <p className={styles.subtitle}>{closingPageMeta.subtitle}</p>
    </div>
  );
}

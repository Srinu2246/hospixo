'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './success-toast.module.css';

type SuccessToastProps = Readonly<{
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}>;

export function SuccessToast({ message, onDismiss, durationMs = 2000 }: SuccessToastProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hideTimer = window.setTimeout(
      () => {
        setLeaving(true);
      },
      Math.max(durationMs - 200, 0),
    );

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, durationMs);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.toast} ${leaving ? styles.toastOut : ''}`}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className={styles.icon} size={18} aria-hidden />
      <p className={styles.message}>{message}</p>
    </div>
  );
}

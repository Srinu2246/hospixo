import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/helpers/cn';

import styles from './admin-button.module.css';

type AdminButtonVariant = 'primary' | 'secondary';

type AdminButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: AdminButtonVariant;
    href?: string;
    loading?: boolean;
    children: ReactNode;
  }
>;

function buttonClassName(variant: AdminButtonVariant, className?: string, disabled?: boolean) {
  return cn(
    styles.button,
    variant === 'primary' ? styles.primary : styles.secondary,
    disabled && styles.disabled,
    className,
  );
}

export function AdminButton({
  variant = 'primary',
  href,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: AdminButtonProps) {
  const isDisabled = disabled || loading;

  if (href && !isDisabled) {
    return (
      <Link href={href} className={buttonClassName(variant, className)}>
        {children}
      </Link>
    );
  }

  if (href && isDisabled) {
    return (
      <span className={buttonClassName(variant, className, true)} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={buttonClassName(variant, className, isDisabled)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? '…' : children}
    </button>
  );
}

'use client';

import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import styles from './pos-compact-page.module.css';

interface PosCompactPageProps {
  children: React.ReactNode;
  className?: string;
}

export function PosCompactPage({ children, className }: Readonly<PosCompactPageProps>) {
  return <div className={cn(styles.page, className)}>{children}</div>;
}

interface PosCompactHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PosCompactHeader({ children, className }: Readonly<PosCompactHeaderProps>) {
  return <div className={cn(styles.header, className)}>{children}</div>;
}

interface PosCompactHeaderChromeProps {
  children: React.ReactNode;
  className?: string;
}

/** White header row below title — tabs, filters, etc. */
export function PosCompactHeaderChrome({
  children,
  className,
}: Readonly<PosCompactHeaderChromeProps>) {
  return <div className={cn(styles.headerChrome, className)}>{children}</div>;
}

interface PosCompactBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PosCompactBody({ children, className }: Readonly<PosCompactBodyProps>) {
  return <div className={cn(styles.body, 'posHideScrollbar', className)}>{children}</div>;
}

interface PosCompactSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

/** Search field — always rendered at top of compact body (#F8FAFC zone). */
export function PosCompactSearch({
  value,
  onChange,
  placeholder,
  className,
}: Readonly<PosCompactSearchProps>) {
  return (
    <label className={cn(styles.search, className)}>
      <Search size={18} className={styles.searchIcon} aria-hidden />
      <input
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

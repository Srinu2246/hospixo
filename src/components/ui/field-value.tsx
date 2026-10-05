'use client';

import { cn } from '@/helpers/cn';

export type FieldValueProps = Readonly<{
  text?: string;
  className?: string;
}>;

export function FieldValue({ text, className }: FieldValueProps) {
  const value = text?.trim() ?? '';
  return (
    <span className={cn(className)} title={value.length > 48 ? value : undefined}>
      {value || '—'}
    </span>
  );
}

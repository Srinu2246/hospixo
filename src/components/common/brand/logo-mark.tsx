'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

type LogoMarkProps = Readonly<{
  className?: string;
}>;

export function LogoMark({ className }: LogoMarkProps) {
  const gradientTopId = useId();
  const gradientBottomId = useId();

  return (
    <svg
      className={cn('h-5 w-3.5 shrink-0', className)}
      viewBox="0 0 14 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6.96582 0.633236C6.96582 0.283509 7.24933 0 7.59906 0H13.2982C13.6479 0 13.9314 0.28351 13.9314 0.633237V15.2309C13.9314 15.7951 13.2493 16.0776 12.8504 15.6787L6.96582 9.79406V0.633236Z"
        fill={`url(#${gradientTopId})`}
      />
      <path
        d="M6.96582 18.9551C6.96582 19.3049 6.68231 19.5884 6.33258 19.5884H0.633451C0.283723 19.5884 0.000213623 19.3049 0.000213623 18.9551V4.35748C0.000213623 3.79333 0.6823 3.5108 1.08122 3.90971L6.96582 9.79431V18.9551Z"
        fill={`url(#${gradientBottomId})`}
      />
      <defs>
        <linearGradient
          id={gradientTopId}
          x1="10.4486"
          y1="0.928748"
          x2="10.4486"
          y2="16.7597"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0048B5" />
          <stop offset="1" stopColor="#4B93FF" />
        </linearGradient>
        <linearGradient
          id={gradientBottomId}
          x1="3.48302"
          y1="2.82871"
          x2="3.48302"
          y2="18.6596"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4B93FF" />
          <stop offset="1" stopColor="#0048B5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

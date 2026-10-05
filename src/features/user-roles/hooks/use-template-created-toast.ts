'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export function useTemplateCreatedToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toastParam = searchParams?.get('toast') ?? null;
  const templateName = searchParams?.get('name') ?? null;

  const toastMessage = useMemo(() => {
    if (toastParam !== 'template-created') return null;
    const label = templateName?.trim();
    return label ? `Template “${label}” created successfully` : 'Template created successfully';
  }, [toastParam, templateName]);

  const toastKey = `${toastParam ?? ''}-${templateName ?? ''}`;
  const [prevKey, setPrevKey] = useState(toastKey);
  const [dismissed, setDismissed] = useState(false);

  if (prevKey !== toastKey) {
    setPrevKey(toastKey);
    setDismissed(false);
  }

  const showToast = Boolean(toastMessage) && !dismissed;

  const dismissToast = useCallback(() => {
    setDismissed(true);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete('toast');
    params.delete('name');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return { showToast, toastMessage, dismissToast };
}

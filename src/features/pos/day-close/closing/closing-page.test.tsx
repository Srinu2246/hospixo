import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClosingPage } from '@/features/pos/day-close/closing/closing-page';
import { closingPageMeta } from '@/features/pos/day-close/config/closing';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

describe('ClosingPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    replaceMock.mockReset();
    vi.useRealTimers();
  });

  it('redirects to the success screen after the configured delay', () => {
    render(<ClosingPage />);

    expect(screen.getByRole('heading', { name: closingPageMeta.title })).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(closingPageMeta.redirectDelayMs);
    expect(replaceMock).toHaveBeenCalledWith(closingPageMeta.redirectHref);
  });
});

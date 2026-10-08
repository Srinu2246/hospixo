import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CloseBusinessDayHeader } from '@/features/pos/day-close/close-business-day/close-business-day-header';
import { closeBusinessDayPageMeta } from '@/features/pos/day-close/config/close-business-day';

describe('CloseBusinessDayHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and subtitle from config', () => {
    render(<CloseBusinessDayHeader />);

    expect(
      screen.getByRole('heading', { name: closeBusinessDayPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(closeBusinessDayPageMeta.subtitle)).toBeInTheDocument();
  });
});

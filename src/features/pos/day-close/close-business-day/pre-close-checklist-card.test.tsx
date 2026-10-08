import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PreCloseChecklistCard } from '@/features/pos/day-close/close-business-day/pre-close-checklist-card';
import { closeBusinessDayChecklist } from '@/features/pos/day-close/config/close-business-day';

describe('PreCloseChecklistCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders checklist items from config', () => {
    render(<PreCloseChecklistCard />);

    expect(screen.getByRole('heading', { name: 'Pre-Close Checklist' })).toBeInTheDocument();
    for (const item of closeBusinessDayChecklist) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DayCloseShell } from '@/features/pos/day-close/layout/day-close-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/day-close',
}));

vi.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: { first_name: 'Alex', last_name: 'Kim' },
  }),
}));

vi.mock('@/context/dashboard-filter', () => ({
  useDashboardFilter: () => ({
    outletId: 'all',
    setOutletId: vi.fn(),
  }),
}));

vi.mock('@/context/dashboard-data', () => ({
  useDashboardData: () => ({
    data: { outlets: [{ id: 'all', name: 'All Outlets' }] },
  }),
}));

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('DayCloseShell', () => {
  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('data-pos-compact-chrome');
  });

  it('renders day-close page content', () => {
    mockMatchMedia(false);
    const { container } = render(
      <DayCloseShell>
        <p>Day close content</p>
      </DayCloseShell>,
    );

    expect(screen.getByText('Day close content')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(/shell/);
  });

  it('renders mobile header with logo, outlets, explore, profile, and menu', () => {
    mockMatchMedia(true);
    render(
      <DayCloseShell>
        <p>Day close content</p>
      </DayCloseShell>,
    );

    expect(screen.getByLabelText('Hospixo')).toBeInTheDocument();
    expect(screen.getByLabelText('Select outlet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Products/i })).toBeInTheDocument();
    expect(screen.getAllByText('AK')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open menu/i })).toBeInTheDocument();
  });
});

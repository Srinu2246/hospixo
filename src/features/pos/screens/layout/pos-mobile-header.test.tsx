import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: {
      first_name: 'Asha',
      last_name: 'Kumar',
      roles: ['Counter 1'],
    },
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/tables',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: Readonly<{
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }>) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';

describe('PosMobileHeader', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('shows logged-in user initials in the header avatar', () => {
    render(<PosMobileHeader title="Hospixo Tables" subtitle="Hotel Mayukha" />);

    const header = screen.getByRole('banner');
    expect(within(header).getByText('AK')).toBeInTheDocument();
  });

  it('opens the operations drawer from the right-side hamburger', () => {
    render(<PosMobileHeader title="Order Menu" subtitle="Table 12" />);

    expect(screen.getByRole('heading', { name: 'Order Menu' })).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /Open navigation/i });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-label', 'Close navigation');
    expect(screen.getByLabelText('POS operations navigation')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes the drawer when a nav link is clicked', () => {
    render(<PosMobileHeader title="Open Orders" />);

    fireEvent.click(screen.getByRole('button', { name: /Open navigation/i }));
    fireEvent.click(screen.getByRole('link', { name: /Dine In/i }));

    expect(screen.getByRole('button', { name: /Open navigation/i })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });
});

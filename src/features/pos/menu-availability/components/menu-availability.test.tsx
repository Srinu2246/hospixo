import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MenuAvailability } from '@/features/pos/menu-availability/components/menu-availability';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import type { MenuCategory, MenuItem } from '@/features/pos/types/menu-availability';

const categories: MenuCategory[] = [
  { id: 'veg', label: 'Veg Biryanis', enabled: true },
  { id: 'chicken', label: 'Chicken Biryanis', enabled: true },
];

const items: MenuItem[] = [
  {
    id: 'item-veg',
    name: 'Veg Biryani',
    categoryId: 'veg',
    tags: ['Biryani'],
    diet: 'veg',
    status: 'available',
    visibility: 'Online',
    channels: ['all', 'zomato', 'swiggy'],
    surfaces: ['all', 'online'],
  },
  {
    id: 'item-paneer',
    name: 'Paneer Biryani',
    categoryId: 'veg',
    tags: ['Biryani'],
    diet: 'veg',
    status: '86d',
    visibility: 'Online',
    channels: ['all', 'zomato'],
    surfaces: ['all', 'online'],
  },
  {
    id: 'item-chicken',
    name: 'Chicken Biryani',
    categoryId: 'chicken',
    tags: ['Biryani', 'Non Veg'],
    diet: 'non_veg',
    status: 'available',
    visibility: 'Dinein QR',
    channels: ['all', 'hotel-mayukha'],
    surfaces: ['all', 'dinein_qr'],
  },
  {
    id: 'item-hidden',
    name: 'Staff Meal',
    categoryId: 'chicken',
    tags: ['Internal'],
    diet: 'non_veg',
    status: 'hidden',
    visibility: 'Hidden',
    channels: ['all'],
    surfaces: ['all', 'online'],
  },
];

describe('MenuAvailability', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and filters by surface and status', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    expect(screen.getByRole('heading', { name: menuAvailabilityCopy.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: menuAvailabilityCopy.tabs.online }));
    expect(screen.getByRole('tab', { name: /Zomato/i })).toBeInTheDocument();

    const toolbar = screen.getByRole('toolbar', { name: /Filter by availability/i });
    fireEvent.click(within(toolbar).getByRole('button', { name: /86'D ITEMS/i }));
    expect(screen.getByText('Paneer Biryani')).toBeInTheDocument();
    expect(screen.queryByText('Veg Biryani')).not.toBeInTheDocument();
  });

  it('filters by category and search query', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('button', { name: /Chicken Biryanis/i }));
    expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
    expect(screen.queryByText('Veg Biryani')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(menuAvailabilityCopy.searchPlaceholder), {
      target: { value: 'staff' },
    });
    expect(screen.getByText('Staff Meal')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Biryani')).not.toBeInTheDocument();
  });

  it('toggles an item and queues an update message', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('switch', { name: /Mark Veg Biryani as 86'd/i }));
    expect(screen.getByText(/1 item changed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: menuAvailabilityCopy.footer.update }));
    expect(screen.getByRole('status')).toHaveTextContent(/Queued 1 change/i);
  });

  it('disables a whole category', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('switch', { name: /Veg Biryanis category on/i }));
    expect(screen.getByRole('switch', { name: /Veg Biryanis category off/i })).toBeInTheDocument();
    expect(screen.getByText(/1 item changed/i)).toBeInTheDocument();
  });

  it('re-enables a category and restores hidden visibility', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('switch', { name: /Chicken Biryanis category on/i }));
    fireEvent.click(screen.getByRole('switch', { name: /Chicken Biryanis category off/i }));
    expect(
      screen.getByRole('switch', { name: /Chicken Biryanis category on/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Staff Meal')).toBeInTheDocument();
  });

  it("restores an 86'd item and queues plural update copy", () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('switch', { name: /Mark Paneer Biryani as available/i }));
    fireEvent.click(screen.getByRole('switch', { name: /Mark Veg Biryani as 86'd/i }));
    expect(screen.getByText(/2 items changed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: menuAvailabilityCopy.footer.update }));
    expect(screen.getByRole('status')).toHaveTextContent(/Queued 2 changes/i);
  });

  it('clears the category when filtering by status then restores it', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    const toolbar = screen.getByRole('toolbar', { name: /Filter by availability/i });
    fireEvent.click(within(toolbar).getByRole('button', { name: /AVAILABLE/i }));
    fireEvent.click(within(toolbar).getByRole('button', { name: /TOTAL ITEMS/i }));
    expect(screen.getByText('Veg Biryani')).toBeInTheDocument();
  });

  it('switches dine-in channels when the dine-in surface is selected', () => {
    render(<MenuAvailability categories={categories} items={items} />);

    fireEvent.click(screen.getByRole('tab', { name: menuAvailabilityCopy.tabs.dinein_qr }));
    expect(screen.getByRole('tab', { name: /Hotel Mayukha/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Zomato/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Hotel Mayukha/i }));
    expect(screen.getByRole('tab', { name: /Hotel Mayukha/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

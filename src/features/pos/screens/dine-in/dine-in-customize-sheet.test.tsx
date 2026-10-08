import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DineInMenuItem } from '@/features/pos/config/dine-in';
import { dineInMenuItems } from '@/features/pos/config/dine-in';
import { DineInCustomizeSheet } from '@/features/pos/screens/dine-in/dine-in-customize-sheet';

const customizableItem =
  dineInMenuItems.find((item) => item.id === 'biryani-chicken') ?? dineInMenuItems[0];

const minimalItem: DineInMenuItem = {
  id: 'plain-rice',
  name: 'Plain Rice',
  price: 120,
  category: 'mains',
  group: 'MAINS',
  imageUrl: customizableItem.imageUrl,
};

describe('DineInCustomizeSheet', () => {
  const onAdd = vi.fn();
  const onClose = vi.fn();

  afterEach(() => {
    cleanup();
    onAdd.mockReset();
    onClose.mockReset();
  });

  it('renders a simplified sheet when optional sections are unavailable', () => {
    render(<DineInCustomizeSheet item={minimalItem} onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Plain Rice' })).toBeInTheDocument();
    expect(screen.queryByText('Select Portion Size')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Extras')).not.toBeInTheDocument();
    expect(screen.queryByText('Cooking Preference')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
  });

  it('shows included pricing for the default size and supports switching sizes', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mini/i })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: /Mini/i }));
    expect(screen.getByRole('button', { name: /Mini/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Single/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('updates the header price when a different size is selected', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Family/i }));
    expect(screen.getByText('Rs 899')).toBeInTheDocument();
  });

  it('renders customization sections for a customizable item', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: customizableItem.name })).toBeInTheDocument();
    expect(screen.getByText('Select Portion Size')).toBeInTheDocument();
    expect(screen.getByText('Add Extras')).toBeInTheDocument();
    expect(screen.getByText('Cooking Preference')).toBeInTheDocument();
  });

  it('updates size, add-ons, quantity, and cooking preference before adding', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Double/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Extra Raita/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        sizeId: 'double',
        addOnIds: ['raita'],
        cookingPreference: 'Medium',
        quantity: 2,
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates the displayed total when quantity increases', () => {
    render(<DineInCustomizeSheet item={minimalItem} onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByRole('button', { name: /Add Item · Rs 120/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(screen.getByRole('button', { name: /Add Item · Rs 240/i })).toBeInTheDocument();
    expect(screen.getByText('Rs 240')).toBeInTheDocument();
  });

  it('does not decrease quantity below one', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles add-ons off when selected twice', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    const raita = screen.getByRole('checkbox', { name: /Extra Raita/i });
    fireEvent.click(raita);
    fireEvent.click(raita);
    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        addOnIds: [],
      }),
    );
  });

  it('exposes pressed state on cooking preference buttons', () => {
    render(<DineInCustomizeSheet item={customizableItem} onAdd={onAdd} onClose={onClose} />);

    const mild = screen.getByRole('button', { name: 'Mild' });
    expect(mild).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Spicy' }));
    expect(mild).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Spicy' })).toHaveAttribute('aria-pressed', 'true');
  });
});

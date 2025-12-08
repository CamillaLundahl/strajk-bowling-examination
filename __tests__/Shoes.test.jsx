import { render, screen, fireEvent } from '@testing-library/react';
import Shoes from '../src/components/Shoes/Shoes.jsx';
import { describe, test, expect, vi } from 'vitest';

describe('Shoes Component - User Story 2 (Shoe Selection)', () => {
  test('should allow adding a shoe and entering a shoe size', async () => {
    const mockUpdateSize = vi.fn();
    const mockAddShoe = vi.fn();
    const mockRemoveShoe = vi.fn();
    const initialShoes = [];

    const { rerender } = render(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={mockAddShoe}
        removeShoe={mockRemoveShoe}
        shoes={initialShoes}
      />
    );

    const addButton = screen.getByRole('button', { name: '+' });
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);

    expect(mockAddShoe).toHaveBeenCalledTimes(1);

    const updatedShoes = [{ id: 'shoe1', size: '' }];
    
    rerender(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={mockAddShoe}
        removeShoe={mockRemoveShoe}
        shoes={updatedShoes}
      />
    );

    const shoeSizeInput = screen.getByLabelText('Shoe size / person 1');
    expect(shoeSizeInput).toBeInTheDocument();

    fireEvent.change(shoeSizeInput, { target: { name: 'shoe1', value: '42' } });

    expect(mockUpdateSize).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'shoe1', value: '42' }),
      })
    );
  });

  test('should allow removing a shoe size input field', async () => {
    const mockUpdateSize = vi.fn();
    const mockAddShoe = vi.fn();
    const mockRemoveShoe = vi.fn();
    
    const initialShoesWithOne = [{ id: 'shoe-to-remove', size: '40' }];

    const { rerender } = render(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={mockAddShoe}
        removeShoe={mockRemoveShoe}
        shoes={initialShoesWithOne}
      />
    );

    const shoeSizeInput = screen.getByLabelText('Shoe size / person 1');
    expect(shoeSizeInput).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: '-' });
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton);

    expect(mockRemoveShoe).toHaveBeenCalledTimes(1);
    expect(mockRemoveShoe).toHaveBeenCalledWith('shoe-to-remove');

    const updatedShoesAfterRemoval = [];
    rerender(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={mockAddShoe}
        removeShoe={mockRemoveShoe}
        shoes={updatedShoesAfterRemoval}
      />
    );

    expect(screen.queryByLabelText('Shoe size / person 1')).not.toBeInTheDocument();
  });
});
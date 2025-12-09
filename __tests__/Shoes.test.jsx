import { render, screen, fireEvent } from '@testing-library/react';
import Shoes from '../src/components/Shoes/Shoes.jsx';
import { describe, test, expect, vi } from 'vitest';

describe('Shoes Component - User Story 2 (Shoe Selection)', () => {
  let mockUpdateSize;
  let mockAddShoe;
  let mockRemoveShoe;
  let rerenderComponent;

  beforeEach(() => {
    mockUpdateSize = vi.fn();
    mockAddShoe = vi.fn();
    mockRemoveShoe = vi.fn();

    const { rerender } = render(
      <Shoes
        updateSize={mockUpdateSize}
        addShoe={mockAddShoe}
        removeShoe={mockRemoveShoe}
        shoes={[]}
      />
    );

    rerenderComponent = (newShoes) => {
      rerender(
        <Shoes
          updateSize={mockUpdateSize}
          addShoe={mockAddShoe}
          removeShoe={mockRemoveShoe}
          shoes={newShoes}
        />
      );
    };

    mockUpdateSize.mockClear();
    mockAddShoe.mockClear();
    mockRemoveShoe.mockClear();
  });

  test('should allow adding a shoe and entering a shoe size', async () => {
    rerenderComponent([{ id: 'shoe1', size: '' }]);

    const addButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(addButton);
    expect(mockAddShoe).toHaveBeenCalledTimes(1);

    rerenderComponent([{ id: 'shoe1', size: '' }, { id: 'shoe2', size: '' }]);

    const shoeSizeInput = screen.getByLabelText('Shoe size / person 1');
    expect(shoeSizeInput).toBeInTheDocument();

    fireEvent.change(shoeSizeInput, { target: { name: 'shoe1', value: '42' } });
    expect(mockUpdateSize).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'shoe1', value: '42' }),
      })
    );
  });

  test('should allow entering and then changing a shoe size', async () => {
    rerenderComponent([{ id: 'shoe-to-change', size: '' }]); 

    const shoeSizeInput = screen.getByLabelText('Shoe size / person 1');
    expect(shoeSizeInput).toBeInTheDocument();
    expect(shoeSizeInput.value).toBe('');

    fireEvent.change(shoeSizeInput, { target: { name: 'shoe-to-change', value: '40' } });
    expect(mockUpdateSize).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'shoe-to-change', value: '40' }),
      })
    );
    expect(shoeSizeInput.value).toBe('40');

    rerenderComponent([{ id: 'shoe-to-change', size: '40' }]);

    fireEvent.change(shoeSizeInput, { target: { name: 'shoe-to-change', value: '43' } });
    expect(mockUpdateSize).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'shoe-to-change', value: '43' }),
      })
    );
    expect(shoeSizeInput.value).toBe('43');
  });

  test('should allow removing a shoe size input field', async () => {
    rerenderComponent([{ id: 'shoe-to-remove', size: '40' }]);

    const shoeSizeInput = screen.getByLabelText('Shoe size / person 1');
    expect(shoeSizeInput).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: '-' });
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton);

    expect(mockRemoveShoe).toHaveBeenCalledTimes(1);
    expect(mockRemoveShoe).toHaveBeenCalledWith('shoe-to-remove');

    rerenderComponent([]);

    expect(screen.queryByLabelText('Shoe size / person 1')).not.toBeInTheDocument();
  });
});
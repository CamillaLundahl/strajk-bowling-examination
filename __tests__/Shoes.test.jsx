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

  //Användaren ska kunna ange skostorlek för varje spelare.
  //Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen.
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

  //Användaren ska kunna ändra skostorlek för varje spelare.
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

  //Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
  //När användaren tar bort skostorleken för en spelare ska systemet uppdatera bokningen så att inga skor längre är bokade för den spelaren.
  //Om användaren tar bort skostorleken ska systemet inte inkludera den spelaren i skorantalet och priset för skor i den totala bokningssumman.
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
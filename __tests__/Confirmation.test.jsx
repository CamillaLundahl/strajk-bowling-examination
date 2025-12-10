import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Confirmation from '../src/views/Confirmation.jsx';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

const mockedUseLocation = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => mockedUseLocation.mockReturnValue({ state: null }),
  };
});

describe('Confirmation Component', () => {

  beforeEach(() => {
    mockedUseLocation.mockClear();
    sessionStorage.clear();
  });

  const renderConfirmationComponent = () => {
    render(
      <BrowserRouter>
        <Confirmation />
      </BrowserRouter>
    );
  };

  //Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord eller finns i session storage ska texten "Ingen bokning gjord visas
  test('should display "Ingen bokning gjord!" if no booking data is found', async () => {
    renderConfirmationComponent();

    await waitFor(() => {
      expect(screen.getByText('Inga bokning gjord!')).toBeInTheDocument();
    });
  });

  //Om användaren navigerar till bekräftelsevyn och det finns en bokning sparad i session storage ska denna visas.
  test('should display booking details if found in session storage', async () => {
    mockedUseLocation.mockReturnValue({ state: null });

    const mockConfirmation = {
      when: '2025-12-25T18:00',
      people: 4,
      lanes: 1,
      bookingId: 'CONFIRM123',
      price: 580,
      shoes: ['40', '41', '42', '43'],
    };
    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmationComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('2025-12-25 18:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CONFIRM123')).toBeInTheDocument();
      expect(screen.getByText('580 sek')).toBeInTheDocument();
    });
  });
});

import { screen, waitFor, fireEvent } from '@testing-library/react'; // Lade till fireEvent här!
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { 
  fillBookingInfo, 
  addAndFillShoes, 
  renderBookingComponent, 
  clickBookButton, 
  mockSuccessfulFetch, 
  expectBookingError 
} from './booking-test-utils.jsx';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('Booking Component', () => {

  beforeEach(() => {
    mockedUsedNavigate.mockClear();
    sessionStorage.clear();
    global.fetch = vi.fn();
  });

  test('should allow user to input date, time, number of players, and number of lanes', () => {
    renderBookingComponent();
    fillBookingInfo();

    expect(screen.getByLabelText(/Date/i)).toHaveValue('2025-12-25');
    expect(screen.getByLabelText(/Time/i)).toHaveValue('18:00');
    expect(screen.getByLabelText(/Number of awesome bowlers/i)).toHaveValue(4);
    expect(screen.getByLabelText(/Number of lanes/i)).toHaveValue(1);
  });

  test('should successfully book and navigate to confirmation with correct details', async () => {
    mockSuccessfulFetch();

    renderBookingComponent();
    fillBookingInfo();
    addAndFillShoes(4);
    clickBookButton();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            when: "2025-12-25T18:00",
            lanes: "1",
            people: "4",
            shoes: ['40', '41', '42', '43'],
          }),
        })
      );
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/confirmation', {
        state: {
          confirmationDetails: {
            when: '2025-12-25T18:00',
            people: 4,
            lanes: 1,
            bookingId: 'MOCKID123',
            price: 580,
            shoes: ['40', '41', '42', '43'],
          }
        },
      });

      const storedConfirmation = JSON.parse(sessionStorage.getItem('confirmation'));
      expect(storedConfirmation).toEqual({
        when: '2025-12-25T18:00',
        people: 4,
        lanes: 1,
        bookingId: 'MOCKID123',
        price: 580,
        shoes: ['40', '41', '42', '43'],
      });
    });
  });

  test('should show error message if required fields are not filled', async () => {
    renderBookingComponent();
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  test('should show error if number of shoes does not match number of people', async () => {
    renderBookingComponent();
    fillBookingInfo();
    addAndFillShoes(3);
    clickBookButton();
    await expectBookingError('Antalet skor måste stämma överens med antal spelare', mockedUsedNavigate);
  });

  test('should show error if shoe sizes are not filled for all shoes added', async () => {
    renderBookingComponent();
    fillBookingInfo();
    
    addAndFillShoes(4);
    const shoe4Input = screen.getByLabelText(/Shoe size \/ person 4/i);
    fireEvent.change(shoe4Input, { target: { name: shoe4Input.id, value: '' } });
    clickBookButton();
    await expectBookingError('Alla skor måste vara ifyllda', mockedUsedNavigate);
  });

  test('should show error if too many players for available lanes (max 4 per lane)', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '18:00', '5', '1');
    addAndFillShoes(5);
    clickBookButton();
    await expectBookingError('Det får max vara 4 spelare per bana', mockedUsedNavigate);
  });

  test('should allow removing a shoe field and update booking state', async () => {
    renderBookingComponent();
    
    addAndFillShoes(1);
    
    const shoeInput = screen.getByLabelText(/Shoe size \/ person 1/i);
    expect(shoeInput).toBeInTheDocument();

    const removeShoeButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(removeShoeButton);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Shoe size \/ person 1/i)).not.toBeInTheDocument();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fillBookingInfo('2025-12-25', '18:00', '1', '1');
    clickBookButton();
    await expectBookingError('Antalet skor måste stämma överens med antal spelare', mockedUsedNavigate);
  });
});

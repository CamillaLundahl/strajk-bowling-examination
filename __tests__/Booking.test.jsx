import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Booking from '../src/views/Booking.jsx';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

const fillBookingInfo = (date = '2025-12-25', time = '18:00', people = '4', lanes = '1') => {
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { name: 'when', value: date } });
  fireEvent.change(screen.getByLabelText(/Time/i), { target: { name: 'time', value: time } });
  fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { name: 'people', value: people } });
  fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { name: 'lanes', value: lanes } });
};

const addAndFillShoes = (numberOfShoes, startSize = 40) => {
  const addShoeButton = screen.getByRole('button', { name: '+' });
  for (let i = 0; i < numberOfShoes; i++) {
    fireEvent.click(addShoeButton);
  }

  for (let i = 0; i < numberOfShoes; i++) {
    const shoeInput = screen.getByLabelText(`Shoe size / person ${i + 1}`);
    fireEvent.change(shoeInput, { target: { name: shoeInput.id, value: String(startSize + i) } });
  }
};

const renderBookingComponent = () => {
  render(
    <BrowserRouter>
      <Booking />
    </BrowserRouter>
  );
};

const clickBookButton = () => {
  const bookButton = screen.getByRole('button', { name: /strIIIIIike!/i });
  fireEvent.click(bookButton);
};

const mockSuccessfulFetch = () => {
  global.fetch.mockImplementationOnce((url, options) => {
    const requestBody = JSON.parse(options.body);
    const pricePerPerson = 120;
    const pricePerLane = 100;
    const calculatedTotalAmount = (parseInt(requestBody.people) * pricePerPerson) + (parseInt(requestBody.lanes) * pricePerLane);

    return Promise.resolve({
      json: () => Promise.resolve({
        bookingDetails: {
          when: requestBody.when,
          people: parseInt(requestBody.people),
          lanes: parseInt(requestBody.lanes),
          bookingId: 'MOCKID123',
          price: calculatedTotalAmount,
          shoes: requestBody.shoes,
        }
      }),
    });
  });
};

const expectBookingError = async (errorMessage) => {
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  expect(global.fetch).not.toHaveBeenCalled();
  expect(mockedUsedNavigate).not.toHaveBeenCalled();
};

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
    await expectBookingError('Alla fälten måste vara ifyllda');
  });

  test('should show error if number of shoes does not match number of people', async () => {
    renderBookingComponent();
    fillBookingInfo();
    addAndFillShoes(3);
    clickBookButton();
    await expectBookingError('Antalet skor måste stämma överens med antal spelare');
  });

  test('should show error if shoe sizes are not filled for all shoes added', async () => {
    renderBookingComponent();
    fillBookingInfo();
    
    addAndFillShoes(4);
    const shoe4Input = screen.getByLabelText(/Shoe size \/ person 4/i);
    fireEvent.change(shoe4Input, { target: { name: shoe4Input.id, value: '' } });
    clickBookButton();
    await expectBookingError('Alla skor måste vara ifyllda');
  });

  test('should show error if too many players for available lanes (max 4 per lane)', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '18:00', '5', '1');
    addAndFillShoes(5);
    clickBookButton();
    await expectBookingError('Det får max vara 4 spelare per bana');
  });
});

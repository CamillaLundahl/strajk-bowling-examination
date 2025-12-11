import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Booking from '../src/views/Booking.jsx';
import { vi } from 'vitest';

export const fillBookingInfo = (date = '2025-12-25', time = '18:00', people = '4', lanes = '1') => {
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { name: 'when', value: date } });
  fireEvent.change(screen.getByLabelText(/Time/i), { target: { name: 'time', value: time } });
  fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { name: 'people', value: people } });
  fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { name: 'lanes', value: lanes } });
};

export const addAndFillShoes = (numberOfShoes, startSize = 40) => {
  const addShoeButton = screen.getByRole('button', { name: '+' });
  for (let i = 0; i < numberOfShoes; i++) {
    fireEvent.click(addShoeButton);
  }

  for (let i = 0; i < numberOfShoes; i++) {
    const shoeInput = screen.getByLabelText(`Shoe size / person ${i + 1}`);
    fireEvent.change(shoeInput, { target: { name: shoeInput.id, value: String(startSize + i) } });
  }
};

export const renderBookingComponent = () => {
  render(
    <BrowserRouter>
      <Booking />
    </BrowserRouter>
  );
};

export const clickBookButton = () => {
  const bookButton = screen.getByRole('button', { name: /strIIIIIike!/i });
  fireEvent.click(bookButton);
};

export const mockSuccessfulFetch = () => {
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

export const expectBookingError = async (errorMessage, mockedUsedNavigate) => {
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  expect(global.fetch).not.toHaveBeenCalled();
  expect(mockedUsedNavigate).not.toHaveBeenCalled();
};

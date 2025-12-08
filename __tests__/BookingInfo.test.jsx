import { render, screen, fireEvent } from '@testing-library/react';
import BookingInfo from '../src/components/BookingInfo/BookingInfo.jsx';
import { describe, test, expect, vi } from 'vitest';

describe('BookingInfo Component - User Story 1 (Input Fields)', () => {
  test('should render input fields and allow input', () => {
    const mockUpdateBookingDetails = vi.fn();

    render(
      <BookingInfo updateBookingDetails={mockUpdateBookingDetails} />
    );

    const dateInput = screen.getByLabelText('Date');
    expect(dateInput).toBeInTheDocument();
    fireEvent.change(dateInput, { target: { name: 'when', value: '2025-12-25' } });
    expect(mockUpdateBookingDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'when', value: '2025-12-25' }),
      })
    );

    const timeInput = screen.getByLabelText('Time');
    expect(timeInput).toBeInTheDocument();
    fireEvent.change(timeInput, { target: { name: 'time', value: '18:00' } });
    expect(mockUpdateBookingDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'time', value: '18:00' }),
      })
    );

    const playersInput = screen.getByLabelText('Number of awesome bowlers');
    expect(playersInput).toBeInTheDocument();
    fireEvent.change(playersInput, { target: { name: 'people', value: '4' } });
    expect(mockUpdateBookingDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'people', value: '4' }),
      })
    );

    const lanesInput = screen.getByLabelText('Number of lanes');
    expect(lanesInput).toBeInTheDocument();
    fireEvent.change(lanesInput, { target: { name: 'lanes', value: '2' } });
    expect(mockUpdateBookingDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'lanes', value: '2' }),
      })
    );
  });
});
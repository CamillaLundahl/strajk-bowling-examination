import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Navigation from '../src/components/Navigation/Navigation.jsx';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('Navigation Component', () => {

  beforeEach(() => {
    mockedUsedNavigate.mockClear();
  });

  const renderNavigationComponent = () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
  };

  test('should render navigation links, allow toggling visibility and navigation', async () => {
    renderNavigationComponent();

    const navIcon = screen.getByRole('img');
    const bookingLink = screen.getByText('Booking');
    const confirmationLink = screen.getByText('Confirmation');
    
    expect(navIcon).toBeInTheDocument();
    expect(bookingLink).toHaveClass('hide');
    expect(confirmationLink).toHaveClass('hide');

    fireEvent.click(navIcon);

    await waitFor(() => {
      expect(bookingLink).not.toHaveClass('hide');
      expect(confirmationLink).not.toHaveClass('hide');
    });

    fireEvent.click(bookingLink);
    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(confirmationLink);
    expect(mockedUsedNavigate).toHaveBeenCalledTimes(2);
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/confirmation');

    fireEvent.click(navIcon);
    await waitFor(() => {
      expect(bookingLink).toHaveClass('hide');
      expect(confirmationLink).toHaveClass('hide');
    });
  });
});

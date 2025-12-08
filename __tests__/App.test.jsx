import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { describe, test, expect } from 'vitest';

describe('App Component', () => {
  test('renders the App component', () => {
    render(
      <App />
    );

    expect(screen.getByRole('heading', { name: /BOOKING/i })).toBeInTheDocument();
  });
});


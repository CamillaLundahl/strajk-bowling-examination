import { screen, waitFor, fireEvent } from '@testing-library/react';
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

  //Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem.
  //Användaren ska kunna ange antal spelare (minst 1 spelare).
  //Användaren ska kunna reservera ett eller flera banor beroende på antal spelare.
  test('should allow user to input date, time, number of players, and number of lanes', () => {
    renderBookingComponent();
    fillBookingInfo();

    expect(screen.getByLabelText(/Date/i)).toHaveValue('2025-12-25');
    expect(screen.getByLabelText(/Time/i)).toHaveValue('18:00');
    expect(screen.getByLabelText(/Number of awesome bowlers/i)).toHaveValue(4);
    expect(screen.getByLabelText(/Number of lanes/i)).toHaveValue(1);
  });

  //Användaren ska kunna slutföra bokningen genom att klicka på en "slutför bokning"-knapp.
  //Systemet ska generera ett bokningsnummer och visa detta till användaren efter att bokningen är slutförd.
  //Systemet ska beräkna och visa den totala summan för bokningen baserat på antalet spelare (120 kr per person) samt antalet reserverade banor (100 kr per bana).
  //Den totala summan ska visas tydligt på bekräftelsesidan och inkludera en uppdelning mellan spelare och banor.
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

  //VG: Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas.
  //(Specifikt för saknat datum)
  test('should show "Alla fälten måste vara ifyllda" if date is missing', async () => {
    renderBookingComponent();
    fillBookingInfo('', '18:00', '4', '1');
    addAndFillShoes(4);
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  //(Specifikt för saknad tid)
  test('should show "Alla fälten måste vara ifyllda" if time is missing', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '', '4', '1');
    addAndFillShoes(4);
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  //(Specifikt för antal spelare mindre än 1)
  test('should show "Alla fälten måste vara ifyllda" if number of bowlers is less than 1', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '18:00', '0', '1');
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  //(Specifikt för antal banor mindre än 1)
  test('should show "Alla fälten måste vara ifyllda" if number of lanes is less than 1', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '18:00', '4', '0');
    addAndFillShoes(4);
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  //(Generellt fall när alla obligatoriska fält är tomma)
  test('should show "Alla fälten måste vara ifyllda" if all required fields are empty', async () => {
    renderBookingComponent();
    clickBookButton();
    await expectBookingError('Alla fälten måste vara ifyllda', mockedUsedNavigate);
  });

  //VG: Om antalet personer och skor inte matchas ska ett felmeddelande visas.
  test('should show error if number of shoes does not match number of people', async () => {
    renderBookingComponent();
    fillBookingInfo();
    addAndFillShoes(3);
    clickBookButton();
    await expectBookingError('Antalet skor måste stämma överens med antal spelare', mockedUsedNavigate);
  });

  //VG: Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande och be om att skostorleken anges.
  test('should show error if shoe sizes are not filled for all shoes added', async () => {
    renderBookingComponent();
    fillBookingInfo();
    addAndFillShoes(4);
    const shoe4Input = screen.getByLabelText(/Shoe size \/ person 4/i);
    fireEvent.change(shoe4Input, { target: { name: shoe4Input.id, value: '' } });
    clickBookButton();
    await expectBookingError('Alla skor måste vara ifyllda', mockedUsedNavigate);
  });

  //VG: Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande.
  test('should show error if too many players for available lanes (max 4 per lane)', async () => {
    renderBookingComponent();
    fillBookingInfo('2025-12-25', '18:00', '5', '1');
    addAndFillShoes(5);
    clickBookButton();
    await expectBookingError('Det får max vara 4 spelare per bana', mockedUsedNavigate);
  });

  //Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare.
  //När användaren tar bort skostorleken för en spelare ska systemet uppdatera bokningen så att inga skor längre är bokade för den spelaren.
  //Om användaren tar bort skostorleken ska systemet inte inkludera den spelaren i skorantalet och priset för skor i den totala bokningssumman.
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

    fillBookingInfo('2025-12-25', '18:00', '1', '1');
    clickBookButton();
    await expectBookingError('Antalet skor måste stämma överens med antal spelare', mockedUsedNavigate);
  });
});
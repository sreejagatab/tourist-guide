// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import '@testing-library/cypress/add-commands';

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});

// Select a tour
Cypress.Commands.add('selectTour', (tourId: string) => {
  cy.visit(`/tours/${tourId}/details`);
  cy.contains('Book Now').click();
  cy.url().should('include', `/tours/${tourId}/book`);
});

// Fill booking form
Cypress.Commands.add('fillBookingForm', (date: string, numberOfPeople: number) => {
  cy.get('input[name="date"]').type(date);
  cy.get('input[name="numberOfPeople"]').clear().type(numberOfPeople.toString());
  cy.contains('Proceed to Payment').click();
});

// Fill payment form with test card
Cypress.Commands.add('fillPaymentForm', () => {
  // Using Stripe test card
  cy.get('input[name="cardNumber"]').type('4242424242424242');
  cy.get('input[name="cardExpiry"]').type('1230');
  cy.get('input[name="cardCvc"]').type('123');
  cy.get('input[name="billingName"]').type('Test User');
  cy.get('input[name="billingPostalCode"]').type('12345');
  cy.get('input[name="termsAccepted"]').check();
  cy.contains('Confirm Payment').click();
});

// Add tour to favorites
Cypress.Commands.add('addToFavorites', (tourId: string) => {
  cy.visit(`/tours/${tourId}/details`);
  cy.get('[data-testid="favorite-button"]').click();
  cy.get('[data-testid="favorite-button"]').should('have.attr', 'aria-pressed', 'true');
});

// Remove tour from favorites
Cypress.Commands.add('removeFromFavorites', (tourId: string) => {
  cy.visit(`/tours/${tourId}/details`);
  cy.get('[data-testid="favorite-button"][aria-pressed="true"]').click();
  cy.get('[data-testid="favorite-button"]').should('have.attr', 'aria-pressed', 'false');
});

// Save tour for offline use
Cypress.Commands.add('saveForOffline', (tourId: string) => {
  cy.visit(`/tours/${tourId}/details`);
  cy.get('[data-testid="offline-button"]').click();
  cy.get('[data-testid="offline-button"]').should('have.attr', 'aria-pressed', 'true');
});

// Write a review
Cypress.Commands.add('writeReview', (tourId: string, rating: number, comment: string) => {
  cy.visit(`/tours/${tourId}/details`);
  cy.contains('Write a Review').click();
  cy.get('[data-testid="rating-input"]').click(rating);
  cy.get('textarea[name="comment"]').type(comment);
  cy.contains('Submit Review').click();
  cy.contains('Review Submitted').should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      selectTour(tourId: string): Chainable<void>;
      fillBookingForm(date: string, numberOfPeople: number): Chainable<void>;
      fillPaymentForm(): Chainable<void>;
      addToFavorites(tourId: string): Chainable<void>;
      removeFromFavorites(tourId: string): Chainable<void>;
      saveForOffline(tourId: string): Chainable<void>;
      writeReview(tourId: string, rating: number, comment: string): Chainable<void>;
    }
  }
}

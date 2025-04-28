/// <reference types="cypress" />

describe('Payment Flow', () => {
  beforeEach(() => {
    // Load fixtures
    cy.fixture('user.json').as('userData');
    cy.fixture('tours.json').as('toursData');
    cy.fixture('booking.json').as('bookingData');
    
    // Visit the homepage
    cy.visit('/');
  });
  
  it('should process a successful payment', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to a tour booking page directly
    cy.get('@toursData').then((toursData: any) => {
      cy.visit(`/tours/${toursData.busTour.id}/book`);
      
      // Fill booking form
      cy.get('@bookingData').then((bookingData: any) => {
        // Select date
        cy.get('input[type="date"]').type(bookingData.validBooking.date);
        
        // Select number of people
        cy.get('input[type="number"]').clear().type(bookingData.validBooking.numberOfPeople.toString());
        
        // Proceed to payment
        cy.contains('Proceed to Payment').click();
        
        // Verify we're on the payment page
        cy.url().should('include', '/payment');
        
        // Fill payment form with test card
        cy.get('#card-element').within(() => {
          cy.fillStripeElements('4242424242424242', '12/25', '123');
        });
        
        // Accept terms
        cy.get('input[type="checkbox"]').check();
        
        // Confirm payment
        cy.contains('Confirm Payment').click();
        
        // Verify payment success
        cy.contains('Payment Successful', { timeout: 10000 }).should('be.visible');
        cy.contains('Your booking has been confirmed').should('be.visible');
        
        // Verify booking details are displayed
        cy.contains(toursData.busTour.name).should('be.visible');
        cy.contains(bookingData.validBooking.date).should('be.visible');
        cy.contains(`${bookingData.validBooking.numberOfPeople} people`).should('be.visible');
      });
    });
  });
  
  it('should handle declined payment', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to a tour booking page directly
    cy.get('@toursData').then((toursData: any) => {
      cy.visit(`/tours/${toursData.bikeTour.id}/book`);
      
      // Fill booking form
      cy.get('@bookingData').then((bookingData: any) => {
        // Select date
        cy.get('input[type="date"]').type(bookingData.validBooking.date);
        
        // Select number of people
        cy.get('input[type="number"]').clear().type(bookingData.validBooking.numberOfPeople.toString());
        
        // Proceed to payment
        cy.contains('Proceed to Payment').click();
        
        // Verify we're on the payment page
        cy.url().should('include', '/payment');
        
        // Fill payment form with declined card
        cy.get('#card-element').within(() => {
          cy.fillStripeElements('4000000000000002', '12/25', '123');
        });
        
        // Accept terms
        cy.get('input[type="checkbox"]').check();
        
        // Confirm payment
        cy.contains('Confirm Payment').click();
        
        // Verify payment declined message
        cy.contains('Payment Failed', { timeout: 10000 }).should('be.visible');
        cy.contains('Your card was declined').should('be.visible');
        
        // Verify retry option
        cy.contains('Try Again').should('be.visible');
      });
    });
  });
  
  it('should validate payment form fields', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to a tour booking page and proceed to payment
    cy.get('@toursData').then((toursData: any) => {
      cy.visit(`/tours/${toursData.walkingTour.id}/book`);
      
      // Fill booking form
      cy.get('@bookingData').then((bookingData: any) => {
        // Select date
        cy.get('input[type="date"]').type(bookingData.validBooking.date);
        
        // Select number of people
        cy.get('input[type="number"]').clear().type(bookingData.validBooking.numberOfPeople.toString());
        
        // Proceed to payment
        cy.contains('Proceed to Payment').click();
        
        // Try to submit without filling payment details
        cy.contains('Confirm Payment').click();
        
        // Verify validation errors
        cy.contains('Please enter card details').should('be.visible');
        cy.contains('You must accept the terms and conditions').should('be.visible');
        
        // Fill card details but with invalid data
        cy.get('#card-element').within(() => {
          cy.fillStripeElements('4242', '12/99', '12');
        });
        
        // Confirm payment
        cy.contains('Confirm Payment').click();
        
        // Verify card validation error
        cy.contains('Your card number is incomplete').should('be.visible');
      });
    });
  });
  
  it('should allow cancellation of payment', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to a tour booking page directly
    cy.get('@toursData').then((toursData: any) => {
      cy.visit(`/tours/${toursData.busTour.id}/book`);
      
      // Fill booking form
      cy.get('@bookingData').then((bookingData: any) => {
        // Select date
        cy.get('input[type="date"]').type(bookingData.validBooking.date);
        
        // Select number of people
        cy.get('input[type="number"]').clear().type(bookingData.validBooking.numberOfPeople.toString());
        
        // Proceed to payment
        cy.contains('Proceed to Payment').click();
        
        // Verify we're on the payment page
        cy.url().should('include', '/payment');
        
        // Cancel payment
        cy.contains('Cancel').click();
        
        // Verify return to booking page
        cy.url().should('include', '/book');
        cy.contains('Book Now').should('be.visible');
      });
    });
  });
  
  // Custom command to fill Stripe elements with specific card details
  Cypress.Commands.add('fillStripeElements', (cardNumber: string, expiry: string, cvc: string) => {
    // This is a mock implementation since we can't directly interact with Stripe Elements in tests
    cy.log(`Filling Stripe elements with card: ${cardNumber}, expiry: ${expiry}, cvc: ${cvc}`);
    
    // Simulate card entry
    cy.window().then((win) => {
      // Assuming there's a global function to handle card entry
      win.dispatchEvent(new CustomEvent('stripe:card-complete', { 
        detail: { 
          complete: true,
          cardNumber,
          expiry,
          cvc
        } 
      }));
    });
  });
});

export {};

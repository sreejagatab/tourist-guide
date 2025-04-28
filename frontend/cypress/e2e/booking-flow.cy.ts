/// <reference types="cypress" />

describe('Tour Booking Flow', () => {
  beforeEach(() => {
    // Load fixtures
    cy.fixture('user.json').as('userData');
    cy.fixture('tours.json').as('toursData');
    cy.fixture('booking.json').as('bookingData');
    
    // Visit the homepage
    cy.visit('/');
  });
  
  it('should allow a logged-in user to book a tour', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to tours page
    cy.contains('Tours').click();
    cy.url().should('include', '/tours');
    
    // Select a walking tour
    cy.get('@toursData').then((toursData: any) => {
      // Find a tour card with the walking tour name
      cy.contains(toursData.walkingTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.contains('Book Now').click();
        });
      
      // Verify we're on the booking page
      cy.url().should('include', '/book');
      cy.contains(toursData.walkingTour.name).should('be.visible');
      
      // Fill booking form
      cy.get('@bookingData').then((bookingData: any) => {
        // Select date
        cy.get('input[type="date"]').type(bookingData.validBooking.date);
        
        // Select number of people
        cy.get('input[type="number"]').clear().type(bookingData.validBooking.numberOfPeople.toString());
        
        // Verify total price calculation
        cy.contains(`$${bookingData.validBooking.totalPrice.toFixed(2)}`).should('be.visible');
        
        // Proceed to payment
        cy.contains('Proceed to Payment').click();
        
        // Verify we're on the payment page
        cy.url().should('include', '/payment');
        
        // Fill payment form with test card
        cy.get('#card-element').within(() => {
          cy.fillStripeElements();
        });
        
        // Accept terms
        cy.get('input[type="checkbox"]').check();
        
        // Confirm payment
        cy.contains('Confirm Payment').click();
        
        // Verify booking confirmation
        cy.contains('Booking Confirmed', { timeout: 10000 }).should('be.visible');
        cy.contains('Booking Reference:').should('be.visible');
        
        // Verify navigation to bookings page
        cy.contains('View My Bookings').click();
        cy.url().should('include', '/bookings');
        
        // Verify the new booking appears in the list
        cy.contains(toursData.walkingTour.name).should('be.visible');
      });
    });
  });
  
  it('should show validation errors for invalid booking inputs', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to a tour booking page directly
    cy.get('@toursData').then((toursData: any) => {
      cy.visit(`/tours/${toursData.walkingTour.id}/book`);
      
      // Try to proceed without filling the form
      cy.contains('Proceed to Payment').click();
      
      // Verify validation errors
      cy.contains('Please select a date').should('be.visible');
      cy.contains('Please enter the number of people').should('be.visible');
      
      // Enter invalid number of people (0)
      cy.get('input[type="number"]').clear().type('0');
      cy.contains('Proceed to Payment').click();
      cy.contains('Number of people must be at least 1').should('be.visible');
      
      // Enter too many people (exceeding max group size)
      cy.get('input[type="number"]').clear().type('50');
      cy.contains('Proceed to Payment').click();
      cy.contains('exceeds the maximum group size').should('be.visible');
      
      // Enter past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString().split('T')[0];
      cy.get('input[type="date"]').clear().type(pastDateString);
      cy.contains('Proceed to Payment').click();
      cy.contains('Please select a future date').should('be.visible');
    });
  });
  
  it('should redirect unauthenticated users to login when trying to book', function() {
    // Visit tours page without logging in
    cy.visit('/tours');
    
    // Try to book a tour
    cy.get('@toursData').then((toursData: any) => {
      // Find a tour card with the bus tour name
      cy.contains(toursData.busTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.contains('Book Now').click();
        });
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Verify the redirect message
      cy.contains('Please log in to book a tour').should('be.visible');
      
      // Login
      cy.get('@userData').then((userData: any) => {
        cy.get('input[name="email"]').type(userData.regularUser.email);
        cy.get('input[name="password"]').type(userData.regularUser.password);
        cy.get('button[type="submit"]').click();
      });
      
      // Verify redirect back to booking page after login
      cy.url().should('include', '/book');
    });
  });
  
  // Custom command to fill Stripe elements
  Cypress.Commands.add('fillStripeElements', () => {
    // This is a mock implementation since we can't directly interact with Stripe Elements in tests
    // In a real implementation, you would use a test mode of Stripe or mock the Stripe API
    cy.log('Filling Stripe elements with test card data');
    
    // Simulate successful card entry
    cy.window().then((win) => {
      // Assuming there's a global function to handle successful card entry
      win.dispatchEvent(new CustomEvent('stripe:card-complete', { detail: { complete: true } }));
    });
  });
});

export {};

/// <reference types="cypress" />

describe('Favorites Functionality', () => {
  beforeEach(() => {
    // Load fixtures
    cy.fixture('user.json').as('userData');
    cy.fixture('tours.json').as('toursData');
    
    // Visit the homepage
    cy.visit('/');
  });
  
  it('should allow a logged-in user to add and remove tours from favorites', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to tours page
    cy.contains('Tours').click();
    cy.url().should('include', '/tours');
    
    // Add a tour to favorites
    cy.get('@toursData').then((toursData: any) => {
      // Find a tour card with the walking tour name
      cy.contains(toursData.walkingTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Verify success message
      cy.contains('Added to favorites').should('be.visible');
      
      // Navigate to favorites page
      cy.contains('Favorites').click();
      cy.url().should('include', '/favorites');
      
      // Verify the tour is in favorites
      cy.contains(toursData.walkingTour.name).should('be.visible');
      
      // Remove from favorites
      cy.contains(toursData.walkingTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Verify success message
      cy.contains('Removed from favorites').should('be.visible');
      
      // Verify the tour is no longer in favorites
      cy.contains(toursData.walkingTour.name).should('not.exist');
    });
  });
  
  it('should redirect unauthenticated users to login when trying to add to favorites', function() {
    // Visit tours page without logging in
    cy.visit('/tours');
    
    // Try to add a tour to favorites
    cy.get('@toursData').then((toursData: any) => {
      // Find a tour card with the bus tour name
      cy.contains(toursData.busTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Verify the redirect message
      cy.contains('Please log in to add favorites').should('be.visible');
      
      // Login
      cy.get('@userData').then((userData: any) => {
        cy.get('input[name="email"]').type(userData.regularUser.email);
        cy.get('input[name="password"]').type(userData.regularUser.password);
        cy.get('button[type="submit"]').click();
      });
      
      // Verify redirect back to tours page after login
      cy.url().should('include', '/tours');
    });
  });
  
  it('should allow adding multiple tours to favorites', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to tours page
    cy.contains('Tours').click();
    cy.url().should('include', '/tours');
    
    // Add multiple tours to favorites
    cy.get('@toursData').then((toursData: any) => {
      // Add walking tour to favorites
      cy.contains(toursData.walkingTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Add bus tour to favorites
      cy.contains(toursData.busTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Add bike tour to favorites
      cy.contains(toursData.bikeTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Navigate to favorites page
      cy.contains('Favorites').click();
      cy.url().should('include', '/favorites');
      
      // Verify all tours are in favorites
      cy.contains(toursData.walkingTour.name).should('be.visible');
      cy.contains(toursData.busTour.name).should('be.visible');
      cy.contains(toursData.bikeTour.name).should('be.visible');
      
      // Verify favorites count
      cy.get('[data-testid="favorites-count"]').should('contain', '3');
    });
  });
  
  it('should persist favorites across sessions', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Navigate to tours page
    cy.contains('Tours').click();
    cy.url().should('include', '/tours');
    
    // Add a tour to favorites
    cy.get('@toursData').then((toursData: any) => {
      // Find a tour card with the bike tour name
      cy.contains(toursData.bikeTour.name)
        .closest('.MuiCard-root')
        .within(() => {
          cy.get('[data-testid="favorite-button"]').click();
        });
      
      // Logout
      cy.contains('Profile').click();
      cy.contains('Logout').click();
      
      // Login again
      cy.get('@userData').then((userData: any) => {
        cy.login(userData.regularUser.email, userData.regularUser.password);
      });
      
      // Navigate to favorites page
      cy.contains('Favorites').click();
      cy.url().should('include', '/favorites');
      
      // Verify the tour is still in favorites
      cy.contains(toursData.bikeTour.name).should('be.visible');
    });
  });
});

export {};

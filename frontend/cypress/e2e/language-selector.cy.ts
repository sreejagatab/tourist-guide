/// <reference types="cypress" />

describe('Language Selector Functionality', () => {
  beforeEach(() => {
    // Visit the homepage
    cy.visit('/');
  });
  
  it('should change the language when a different language is selected', () => {
    // Find and click the language selector
    cy.get('[aria-label="language"]').click();
    
    // Select Spanish
    cy.contains('Español').click();
    
    // Verify that the language has changed
    cy.contains('Inicio').should('be.visible'); // Home in Spanish
    cy.contains('Iniciar Sesión').should('be.visible'); // Login in Spanish
    
    // Change back to English
    cy.get('[aria-label="language"]').click();
    cy.contains('English').click();
    
    // Verify that the language has changed back to English
    cy.contains('Home').should('be.visible');
    cy.contains('Login').should('be.visible');
  });
  
  it('should persist language preference across page reloads', () => {
    // Find and click the language selector
    cy.get('[aria-label="language"]').click();
    
    // Select French
    cy.contains('Français').click();
    
    // Verify that the language has changed
    cy.contains('Accueil').should('be.visible'); // Home in French
    
    // Reload the page
    cy.reload();
    
    // Verify that the language is still French
    cy.contains('Accueil').should('be.visible');
  });
  
  it('should apply translations to all parts of the application', () => {
    // Find and click the language selector
    cy.get('[aria-label="language"]').click();
    
    // Select Spanish
    cy.contains('Español').click();
    
    // Navigate to tours page
    cy.contains('Tours').click();
    
    // Verify that tour-related content is translated
    cy.contains('Tours a Pie').should('be.visible'); // Walking Tours in Spanish
    cy.contains('Tours en Autobús').should('be.visible'); // Bus Tours in Spanish
    cy.contains('Tours en Bicicleta').should('be.visible'); // Bike Tours in Spanish
    
    // Verify that filter options are translated
    cy.contains('Filtrar').should('be.visible'); // Filter in Spanish
    cy.contains('Ordenar').should('be.visible'); // Sort in Spanish
    
    // Navigate to login page
    cy.contains('Iniciar Sesión').click();
    
    // Verify that login form is translated
    cy.contains('Correo Electrónico').should('be.visible'); // Email in Spanish
    cy.contains('Contraseña').should('be.visible'); // Password in Spanish
  });
  
  it('should handle language-specific formatting correctly', () => {
    // Find and click the language selector
    cy.get('[aria-label="language"]').click();
    
    // Select French
    cy.contains('Français').click();
    
    // Navigate to a tour detail page
    cy.visit('/tours/walking-tour-1/details');
    
    // Verify that date and currency formats are appropriate for French
    // Note: This assumes your app formats dates and currencies according to locale
    cy.get('[data-testid="tour-price"]').should('contain', '€'); // Euro symbol for French
    
    // Change to German
    cy.get('[aria-label="language"]').click();
    cy.contains('Deutsch').click();
    
    // Verify German formatting
    cy.get('[data-testid="tour-price"]').should('contain', '€'); // Euro symbol for German
  });
  
  it('should show language selector in user menu when logged in', () => {
    // Login
    cy.contains('Login').click();
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // Open user menu
    cy.get('[data-testid="user-menu"]').click();
    
    // Verify language selector is in the menu
    cy.contains('Language').should('be.visible');
    
    // Select a language from the user menu
    cy.contains('Español').click();
    
    // Verify language changed
    cy.contains('Perfil').should('be.visible'); // Profile in Spanish
  });
});

export {};

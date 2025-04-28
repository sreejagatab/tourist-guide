/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Load fixtures
    cy.fixture('user.json').as('userData');
    
    // Visit the homepage
    cy.visit('/');
  });
  
  it('should allow a user to register, login, and logout', function() {
    // Generate a unique email for registration
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = 'Password123!';
    const username = `testuser-${Date.now()}`;
    
    // Navigate to register page
    cy.contains('Register').click();
    cy.url().should('include', '/register');
    
    // Fill registration form
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    
    // Submit registration form
    cy.get('button[type="submit"]').click();
    
    // Verify successful registration and redirect to login
    cy.contains('Registration successful').should('be.visible');
    cy.url().should('include', '/login');
    
    // Login with the newly created account
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.contains('Login successful').should('be.visible');
    cy.url().should('include', '/');
    
    // Verify user is logged in
    cy.contains('Profile').should('be.visible');
    
    // Logout
    cy.contains('Profile').click();
    cy.contains('Logout').click();
    
    // Verify successful logout
    cy.contains('Logout successful').should('be.visible');
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });
  
  it('should show validation errors for invalid registration inputs', function() {
    // Navigate to register page
    cy.contains('Register').click();
    cy.url().should('include', '/register');
    
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Verify validation errors
    cy.contains('Username is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Enter invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Enter short password
    cy.get('input[name="password"]').type('short');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 8 characters').should('be.visible');
    
    // Enter mismatched passwords
    cy.get('input[name="password"]').clear().type('Password123!');
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match').should('be.visible');
  });
  
  it('should show error for invalid login credentials', function() {
    // Navigate to login page
    cy.contains('Login').click();
    cy.url().should('include', '/login');
    
    // Enter invalid credentials
    cy.get('input[name="email"]').type('nonexistent@example.com');
    cy.get('input[name="password"]').type('WrongPassword123!');
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.contains('Invalid email or password').should('be.visible');
  });
  
  it('should redirect to protected pages after login', function() {
    // Try to access a protected page without logging in
    cy.visit('/profile');
    
    // Verify redirect to login page
    cy.url().should('include', '/login');
    
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.get('input[name="email"]').type(userData.regularUser.email);
      cy.get('input[name="password"]').type(userData.regularUser.password);
      cy.get('button[type="submit"]').click();
    });
    
    // Verify redirect to the originally requested protected page
    cy.url().should('include', '/profile');
  });
  
  it('should maintain authentication state across page reloads', function() {
    // Login
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.regularUser.email, userData.regularUser.password);
    });
    
    // Verify user is logged in
    cy.contains('Profile').should('be.visible');
    
    // Reload the page
    cy.reload();
    
    // Verify user is still logged in after reload
    cy.contains('Profile').should('be.visible');
  });
  
  it('should redirect admin users to admin dashboard', function() {
    // Login as admin
    cy.get('@userData').then((userData: any) => {
      cy.login(userData.adminUser.email, userData.adminUser.password);
    });
    
    // Navigate to admin dashboard
    cy.contains('Admin').click();
    
    // Verify access to admin dashboard
    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('be.visible');
    
    // Verify admin-specific features
    cy.contains('Manage Tours').should('be.visible');
    cy.contains('Manage Users').should('be.visible');
    cy.contains('Manage Bookings').should('be.visible');
  });
});

export {};

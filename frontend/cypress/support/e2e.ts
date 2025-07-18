// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Disable screenshots on failure in CI environment
if (Cypress.env('CI')) {
  Cypress.Screenshot.defaults({
    screenshotOnRunFailure: false
  });
}

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['jwt', 'refreshToken', 'i18nextLng']
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

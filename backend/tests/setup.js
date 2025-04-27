// Setup file for backend tests

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/tourguide-test';

// Global setup
beforeAll(async () => {
  // Any global setup needed before all tests
  console.log('Starting test suite');
});

// Global teardown
afterAll(async () => {
  // Any global cleanup needed after all tests
  console.log('Test suite completed');
});

// Mock any global dependencies if needed
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

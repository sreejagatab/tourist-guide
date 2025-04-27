const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app'); // Assuming you have an app.js file that exports the Express app
const Tour = require('../src/models/tour.model');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

// Mock data
const mockTour = {
  name: 'Test Tour',
  description: 'This is a test tour',
  price: 99.99,
  duration: 3,
  maxGroupSize: 10,
  difficulty: 'medium',
  ratingsAverage: 4.5,
  ratingsQuantity: 10,
  type: 'walking',
  startLocation: {
    type: 'Point',
    coordinates: [-73.985130, 40.748817],
    address: 'Test Address',
    description: 'Test Location'
  },
  locations: [
    {
      type: 'Point',
      coordinates: [-73.985130, 40.748817],
      address: 'Stop 1',
      description: 'First Stop',
      day: 1
    },
    {
      type: 'Point',
      coordinates: [-73.978672, 40.757694],
      address: 'Stop 2',
      description: 'Second Stop',
      day: 1
    }
  ],
  images: ['tour-1-1.jpg', 'tour-1-2.jpg'],
  startDates: [
    new Date('2023-04-25'),
    new Date('2023-07-20'),
    new Date('2023-10-05')
  ]
};

const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  passwordConfirm: 'Password123!',
  role: 'user'
};

// Setup and teardown
beforeAll(async () => {
  // Connect to a test database
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/tourguide-test';
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear the database before each test
  await Tour.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  // Disconnect from the database
  await mongoose.connection.close();
});

// Helper function to get auth token
const getAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

// Tests
describe('Tour API', () => {
  describe('GET /api/tours', () => {
    test('should return all tours', async () => {
      // Create a test tour
      await Tour.create(mockTour);
      
      // Make request
      const response = await request(app).get('/api/tours');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(1);
      expect(response.body.data.tours.length).toBe(1);
      expect(response.body.data.tours[0].name).toBe(mockTour.name);
    });
    
    test('should filter tours by type', async () => {
      // Create test tours
      await Tour.create(mockTour);
      await Tour.create({
        ...mockTour,
        name: 'Bus Tour',
        type: 'bus'
      });
      
      // Make request
      const response = await request(app).get('/api/tours?type=walking');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.results).toBe(1);
      expect(response.body.data.tours[0].type).toBe('walking');
    });
  });
  
  describe('GET /api/tours/:id', () => {
    test('should return a single tour', async () => {
      // Create a test tour
      const tour = await Tour.create(mockTour);
      
      // Make request
      const response = await request(app).get(`/api/tours/${tour._id}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tour.name).toBe(mockTour.name);
    });
    
    test('should return 404 for non-existent tour', async () => {
      // Make request with a non-existent ID
      const response = await request(app).get(`/api/tours/${new mongoose.Types.ObjectId()}`);
      
      // Assertions
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/tours', () => {
    test('should create a new tour when authenticated as admin', async () => {
      // Create an admin user
      const adminUser = await User.create({
        ...mockUser,
        role: 'admin'
      });
      
      // Get auth token
      const token = getAuthToken(adminUser);
      
      // Make request
      const response = await request(app)
        .post('/api/tours')
        .set('Authorization', `Bearer ${token}`)
        .send(mockTour);
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tour.name).toBe(mockTour.name);
      
      // Check if tour was actually created in the database
      const tourInDb = await Tour.findById(response.body.data.tour._id);
      expect(tourInDb).toBeTruthy();
      expect(tourInDb.name).toBe(mockTour.name);
    });
    
    test('should return 401 when not authenticated', async () => {
      // Make request without auth token
      const response = await request(app)
        .post('/api/tours')
        .send(mockTour);
      
      // Assertions
      expect(response.status).toBe(401);
    });
    
    test('should return 403 when authenticated as regular user', async () => {
      // Create a regular user
      const regularUser = await User.create(mockUser);
      
      // Get auth token
      const token = getAuthToken(regularUser);
      
      // Make request
      const response = await request(app)
        .post('/api/tours')
        .set('Authorization', `Bearer ${token}`)
        .send(mockTour);
      
      // Assertions
      expect(response.status).toBe(403);
    });
  });
  
  // Add more tests for other endpoints
});

describe('User Authentication', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      // Make request
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.username).toBe(mockUser.username);
      expect(response.body.data.user.email).toBe(mockUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.token).toBeTruthy(); // Should return a JWT token
      
      // Check if user was actually created in the database
      const userInDb = await User.findOne({ email: mockUser.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.username).toBe(mockUser.username);
    });
    
    test('should return 400 for duplicate email', async () => {
      // Create a user first
      await User.create(mockUser);
      
      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser);
      
      // Assertions
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    test('should login a user with valid credentials', async () => {
      // Create a user
      await User.create(mockUser);
      
      // Make login request
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(mockUser.email);
      expect(response.body.token).toBeTruthy();
    });
    
    test('should return 401 for invalid credentials', async () => {
      // Create a user
      await User.create(mockUser);
      
      // Make login request with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword'
        });
      
      // Assertions
      expect(response.status).toBe(401);
    });
  });
  
  // Add more tests for other auth endpoints
});

// Add more test suites for other API endpoints

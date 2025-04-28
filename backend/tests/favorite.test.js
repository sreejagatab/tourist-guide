const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Tour = require('../src/models/tour.model');
const Itinerary = require('../src/models/itinerary.model');
const jwt = require('jsonwebtoken');

// Mock data
const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'user'
};

const mockTour = {
  name: 'Test Tour',
  description: 'This is a test tour',
  price: 99.99,
  duration: 120,
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
    }
  ],
  images: ['tour-1-1.jpg', 'tour-1-2.jpg']
};

const mockItinerary = {
  name: 'Test Itinerary',
  description: 'Test itinerary description',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
  days: [
    {
      date: new Date(),
      activities: [
        {
          type: 'custom',
          title: 'Test Activity',
          description: 'Test activity description',
          startTime: '09:00',
          endTime: '11:00'
        }
      ]
    }
  ]
};

// Setup and teardown
beforeAll(async () => {
  // Connect to a test database
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/tourguide-test';
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
  await Tour.deleteMany({});
  await Itinerary.deleteMany({});
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

describe('Favorites API', () => {
  describe('GET /api/favorites/tours', () => {
    test('should return user\'s favorite tours', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Add tour to user's favorites
      user.savedTours.push(tour._id);
      await user.save();
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .get('/api/favorites/tours')
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.tours).toBeDefined();
      expect(response.body.tours.length).toBe(1);
      expect(response.body.tours[0]._id.toString()).toBe(tour._id.toString());
    });
    
    test('should return 401 when not authenticated', async () => {
      // Make request without auth token
      const response = await request(app)
        .get('/api/favorites/tours');
      
      // Assertions
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/favorites/tours/:tourId', () => {
    test('should add a tour to favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .post(`/api/favorites/tours/${tour._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('added to favorites');
      expect(response.body.tourId).toBe(tour._id.toString());
      
      // Check if tour was actually added to user's favorites
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.savedTours).toContainEqual(tour._id);
    });
    
    test('should return 400 if tour is already in favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Add tour to user's favorites
      user.savedTours.push(tour._id);
      await user.save();
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .post(`/api/favorites/tours/${tour._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already in favorites');
    });
    
    test('should return 404 for non-existent tour', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request with a non-existent ID
      const response = await request(app)
        .post(`/api/favorites/tours/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('DELETE /api/favorites/tours/:tourId', () => {
    test('should remove a tour from favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Add tour to user's favorites
      user.savedTours.push(tour._id);
      await user.save();
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .delete(`/api/favorites/tours/${tour._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removed from favorites');
      expect(response.body.tourId).toBe(tour._id.toString());
      
      // Check if tour was actually removed from user's favorites
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.savedTours).not.toContainEqual(tour._id);
    });
    
    test('should return 404 if tour is not in favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .delete(`/api/favorites/tours/${tour._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not in favorites');
    });
  });
  
  describe('GET /api/favorites/tours/:tourId/check', () => {
    test('should check if a tour is in favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Add tour to user's favorites
      user.savedTours.push(tour._id);
      await user.save();
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .get(`/api/favorites/tours/${tour._id}/check`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(true);
    });
    
    test('should return false if tour is not in favorites', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create a tour
      const tour = await Tour.create({
        ...mockTour,
        createdBy: user._id
      });
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .get(`/api/favorites/tours/${tour._id}/check`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.isFavorite).toBe(false);
    });
  });
  
  describe('GET /api/favorites/itineraries', () => {
    test('should return user\'s favorite itineraries', async () => {
      // Create a user
      const user = await User.create(mockUser);
      
      // Create an itinerary
      const itinerary = await Itinerary.create({
        ...mockItinerary,
        user: user._id
      });
      
      // Add itinerary to user's favorites
      user.savedItineraries.push(itinerary._id);
      await user.save();
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .get('/api/favorites/itineraries')
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.itineraries).toBeDefined();
      expect(response.body.itineraries.length).toBe(1);
      expect(response.body.itineraries[0]._id.toString()).toBe(itinerary._id.toString());
    });
  });
});

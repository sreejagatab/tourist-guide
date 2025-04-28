const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const AnalyticsEvent = require('../src/models/analytics.model');
const jwt = require('jsonwebtoken');

// Mock data
const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'user'
};

const mockAdminUser = {
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'Password123!',
  role: 'admin'
};

const mockEvent = {
  type: 'pageview',
  data: {
    path: '/tours',
    title: 'Tours Page',
    timestamp: new Date().toISOString(),
    sessionId: 'test-session-id'
  }
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
  await AnalyticsEvent.deleteMany({});
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

describe('Analytics API', () => {
  describe('POST /api/analytics/track', () => {
    test('should track an analytics event', async () => {
      // Make request
      const response = await request(app)
        .post('/api/analytics/track')
        .send({
          type: mockEvent.type,
          data: mockEvent.data
        });
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('tracked successfully');
      
      // Check if event was actually saved in the database
      const events = await AnalyticsEvent.find();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe(mockEvent.type);
      expect(events[0].data.path).toBe(mockEvent.data.path);
    });
    
    test('should return 400 if event data is missing', async () => {
      // Make request without data
      const response = await request(app)
        .post('/api/analytics/track')
        .send({
          type: mockEvent.type
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });
  
  describe('POST /api/analytics/track-batch', () => {
    test('should track a batch of analytics events', async () => {
      // Create batch of events
      const events = [
        {
          type: 'pageview',
          data: {
            path: '/tours',
            title: 'Tours Page',
            timestamp: new Date().toISOString(),
            sessionId: 'test-session-id'
          }
        },
        {
          type: 'event',
          data: {
            category: 'Feature',
            action: 'Click',
            label: 'Book Now',
            timestamp: new Date().toISOString(),
            sessionId: 'test-session-id'
          }
        }
      ];
      
      // Make request
      const response = await request(app)
        .post('/api/analytics/track-batch')
        .send({ events });
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('tracked successfully');
      expect(response.body.count).toBe(2);
      
      // Check if events were actually saved in the database
      const savedEvents = await AnalyticsEvent.find();
      expect(savedEvents.length).toBe(2);
    });
    
    test('should return 400 if events array is missing', async () => {
      // Make request without events
      const response = await request(app)
        .post('/api/analytics/track-batch')
        .send({});
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });
  });
  
  describe('GET /api/analytics/page-views', () => {
    test('should return page view statistics for admin users', async () => {
      // Create an admin user
      const admin = await User.create(mockAdminUser);
      
      // Create some page view events
      await AnalyticsEvent.create([
        {
          type: 'pageview',
          data: { path: '/tours', title: 'Tours Page' }
        },
        {
          type: 'pageview',
          data: { path: '/tours', title: 'Tours Page' }
        },
        {
          type: 'pageview',
          data: { path: '/home', title: 'Home Page' }
        }
      ]);
      
      // Get auth token
      const token = getAuthToken(admin);
      
      // Make request
      const response = await request(app)
        .get('/api/analytics/page-views')
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.pageViews).toBeDefined();
      expect(response.body.pageViews.length).toBe(2);
      
      // Check that /tours has 2 views
      const toursPage = response.body.pageViews.find(page => page.path === '/tours');
      expect(toursPage).toBeDefined();
      expect(toursPage.views).toBe(2);
    });
    
    test('should return 403 for non-admin users', async () => {
      // Create a regular user
      const user = await User.create(mockUser);
      
      // Get auth token
      const token = getAuthToken(user);
      
      // Make request
      const response = await request(app)
        .get('/api/analytics/page-views')
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
    
    test('should return 401 when not authenticated', async () => {
      // Make request without auth token
      const response = await request(app)
        .get('/api/analytics/page-views');
      
      // Assertions
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/analytics/dashboard-summary', () => {
    test('should return dashboard summary for admin users', async () => {
      // Create an admin user
      const admin = await User.create(mockAdminUser);
      
      // Create some regular users
      await User.create([
        mockUser,
        { ...mockUser, username: 'user2', email: 'user2@example.com' },
        { ...mockUser, username: 'user3', email: 'user3@example.com' }
      ]);
      
      // Get auth token
      const token = getAuthToken(admin);
      
      // Make request
      const response = await request(app)
        .get('/api/analytics/dashboard-summary')
        .set('Authorization', `Bearer ${token}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.totalUsers).toBe(4); // 3 regular users + 1 admin
    });
  });
});

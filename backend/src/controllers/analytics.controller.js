const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/analytics.model');
const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');

// Track an analytics event
exports.trackEvent = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ message: 'Event type and data are required' });
    }
    
    // Create a new analytics event
    const event = new AnalyticsEvent({
      type,
      data,
      userId: req.user ? req.user._id : null,
      timestamp: data.timestamp || new Date(),
      sessionId: data.sessionId || null,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null
    });
    
    await event.save();
    
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Track a batch of analytics events
exports.trackBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'Valid events array is required' });
    }
    
    // Process each event in the batch
    const processedEvents = events.map(event => ({
      type: event.type,
      data: event.data,
      userId: req.user ? req.user._id : null,
      timestamp: event.data.timestamp || new Date(),
      sessionId: event.data.sessionId || null,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null
    }));
    
    // Insert all events at once
    await AnalyticsEvent.insertMany(processedEvents);
    
    res.status(201).json({ message: 'Events tracked successfully', count: events.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get page view statistics
exports.getPageViewStats = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.timestamp = { $gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.timestamp = { ...dateFilter.timestamp, $lte: new Date(endDate) };
    }
    
    // Aggregate page views
    const pageViews = await AnalyticsEvent.aggregate([
      { 
        $match: { 
          type: 'pageview',
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: '$data.path',
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          path: '$_id',
          views: 1
        }
      },
      { $sort: { views: -1 } }
    ]);
    
    res.json({ pageViews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user activity statistics
exports.getUserActivityStats = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { period = 'month', limit = 6 } = req.query;
    
    // Determine grouping format based on period
    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%U';
        break;
      case 'month':
      default:
        dateFormat = '%Y-%m';
        break;
    }
    
    // Get user registrations by period
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: dateFormat, 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          date: '$_id',
          users: '$count'
        }
      }
    ]);
    
    // Get bookings by period
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: dateFormat, 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          date: '$_id',
          bookings: '$count'
        }
      }
    ]);
    
    // Get reviews by period
    const reviews = await Review.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: dateFormat, 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          date: '$_id',
          reviews: '$count'
        }
      }
    ]);
    
    // Combine the results
    const dates = new Set();
    [...userRegistrations, ...bookings, ...reviews].forEach(item => dates.add(item.date));
    
    const result = Array.from(dates).map(date => {
      const userEntry = userRegistrations.find(entry => entry.date === date);
      const bookingEntry = bookings.find(entry => entry.date === date);
      const reviewEntry = reviews.find(entry => entry.date === date);
      
      return {
        date,
        users: userEntry ? userEntry.users : 0,
        bookings: bookingEntry ? bookingEntry.bookings : 0,
        reviews: reviewEntry ? reviewEntry.reviews : 0
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({ userActivity: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get device and browser statistics
exports.getDeviceStats = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.timestamp = { $gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.timestamp = { ...dateFilter.timestamp, $lte: new Date(endDate) };
    }
    
    // Helper function to parse user agent
    const parseUserAgent = (userAgent) => {
      // This is a simplified version - in production, use a proper user-agent parser library
      const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
      const isTablet = /tablet|ipad/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;
      
      let browser = 'Other';
      if (/chrome/i.test(userAgent)) browser = 'Chrome';
      else if (/firefox/i.test(userAgent)) browser = 'Firefox';
      else if (/safari/i.test(userAgent)) browser = 'Safari';
      else if (/edge/i.test(userAgent)) browser = 'Edge';
      else if (/msie|trident/i.test(userAgent)) browser = 'Internet Explorer';
      
      let deviceType = 'Other';
      if (isDesktop) deviceType = 'Desktop';
      else if (isTablet) deviceType = 'Tablet';
      else if (isMobile) deviceType = 'Mobile';
      
      return { browser, deviceType };
    };
    
    // Get all events with user agent
    const events = await AnalyticsEvent.find({
      userAgent: { $ne: null },
      ...dateFilter
    }).select('userAgent');
    
    // Process the data
    const deviceCounts = {};
    const browserCounts = {};
    
    events.forEach(event => {
      const { browser, deviceType } = parseUserAgent(event.userAgent);
      
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    
    // Convert to array format for charts
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
    const browserData = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));
    
    res.json({ 
      devices: deviceData,
      browsers: browserData,
      total: events.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tour performance statistics
exports.getTourPerformanceStats = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get most viewed tours
    const tourViews = await AnalyticsEvent.aggregate([
      { 
        $match: { 
          type: 'pageview',
          'data.path': { $regex: /^\/tours\/[a-zA-Z0-9]+\/details$/ }
        } 
      },
      {
        $group: {
          _id: '$data.path',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // Extract tour IDs from paths
    const tourIds = tourViews.map(item => {
      const match = item._id.match(/\/tours\/([a-zA-Z0-9]+)\/details/);
      return match ? match[1] : null;
    }).filter(id => id);
    
    // Get tour details
    const tours = await Tour.find({ _id: { $in: tourIds } })
      .select('name type price ratingsAverage ratingsQuantity');
    
    // Get booking counts for these tours
    const bookingCounts = await Booking.aggregate([
      {
        $match: {
          tour: { $in: tourIds.map(id => mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: '$tour',
          bookings: { $sum: 1 }
        }
      }
    ]);
    
    // Combine the data
    const tourPerformance = tourViews.map(view => {
      const match = view._id.match(/\/tours\/([a-zA-Z0-9]+)\/details/);
      const tourId = match ? match[1] : null;
      
      if (!tourId) return null;
      
      const tour = tours.find(t => t._id.toString() === tourId);
      const bookingData = bookingCounts.find(b => b._id.toString() === tourId);
      
      if (!tour) return null;
      
      return {
        id: tourId,
        name: tour.name,
        type: tour.type,
        views: view.views,
        bookings: bookingData ? bookingData.bookings : 0,
        conversionRate: bookingData ? ((bookingData.bookings / view.views) * 100).toFixed(1) + '%' : '0%',
        rating: tour.ratingsAverage,
        reviewCount: tour.ratingsQuantity
      };
    }).filter(item => item);
    
    res.json({ tourPerformance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard summary statistics
exports.getDashboardSummary = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total tours
    const totalTours = await Tour.countDocuments();
    
    // Get total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get total revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get new bookings in last 30 days
    const newBookings = await Booking.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get revenue in last 30 days
    const newRevenueData = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const newRevenue = newRevenueData.length > 0 ? newRevenueData[0].total : 0;
    
    // Calculate growth percentages
    const userGrowth = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    const bookingGrowth = totalBookings > 0 ? (newBookings / totalBookings) * 100 : 0;
    const revenueGrowth = totalRevenue > 0 ? (newRevenue / totalRevenue) * 100 : 0;
    
    res.json({
      summary: {
        totalUsers,
        totalTours,
        totalBookings,
        totalRevenue,
        newUsers,
        newBookings,
        newRevenue,
        userGrowth: userGrowth.toFixed(1),
        bookingGrowth: bookingGrowth.toFixed(1),
        revenueGrowth: revenueGrowth.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

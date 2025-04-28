const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes - no authentication required
router.post('/track', analyticsController.trackEvent);
router.post('/track-batch', analyticsController.trackBatchEvents);

// Admin-only routes
router.get('/page-views', verifyToken, isAdmin, analyticsController.getPageViewStats);
router.get('/user-activity', verifyToken, isAdmin, analyticsController.getUserActivityStats);
router.get('/devices', verifyToken, isAdmin, analyticsController.getDeviceStats);
router.get('/tour-performance', verifyToken, isAdmin, analyticsController.getTourPerformanceStats);
router.get('/dashboard-summary', verifyToken, isAdmin, analyticsController.getDashboardSummary);

module.exports = router;

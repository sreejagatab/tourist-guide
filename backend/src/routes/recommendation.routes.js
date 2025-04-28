const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Get popular tours (public route)
router.get('/popular', recommendationController.getPopularTours);

// Get similar tours to a specific tour (public route)
router.get('/similar/:tourId', recommendationController.getSimilarTours);

// Protected routes (require authentication)
router.use(authController.protect);

// Get personalized recommendations for the authenticated user
router.get('/personalized', recommendationController.getPersonalizedRecommendations);

module.exports = router;

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Tour favorites
router.get('/tours', favoriteController.getFavoriteTours);
router.post('/tours/:tourId', favoriteController.addTourToFavorites);
router.delete('/tours/:tourId', favoriteController.removeTourFromFavorites);
router.get('/tours/:tourId/check', favoriteController.checkTourInFavorites);

// Itinerary favorites
router.get('/itineraries', favoriteController.getFavoriteItineraries);
router.post('/itineraries/:itineraryId', favoriteController.addItineraryToFavorites);
router.delete('/itineraries/:itineraryId', favoriteController.removeItineraryFromFavorites);

module.exports = router;

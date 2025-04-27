const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itinerary.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/public', itineraryController.getPublicItineraries);

// User routes
router.get('/', verifyToken, itineraryController.getUserItineraries);
router.get('/:id', verifyToken, itineraryController.getItineraryById);
router.post('/', verifyToken, itineraryController.createItinerary);
router.put('/:id', verifyToken, itineraryController.updateItinerary);
router.delete('/:id', verifyToken, itineraryController.deleteItinerary);
router.post('/:id/tour', verifyToken, itineraryController.addTourToItinerary);
router.post('/:id/share', verifyToken, itineraryController.shareItinerary);

module.exports = router;

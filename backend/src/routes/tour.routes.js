const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { verifyToken, isGuide, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', tourController.getAllTours);
router.get('/search', tourController.searchTours);
router.get('/type/:type', tourController.getToursByType);
router.get('/:id', tourController.getTourById);

// Protected routes
router.post('/', verifyToken, isGuide, tourController.createTour);
router.put('/:id', verifyToken, tourController.updateTour);
router.delete('/:id', verifyToken, tourController.deleteTour);

module.exports = router;

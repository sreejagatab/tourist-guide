const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// User routes
router.get('/user', verifyToken, bookingController.getUserBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.post('/', verifyToken, bookingController.createBooking);
router.put('/:id/status', verifyToken, bookingController.updateBookingStatus);

// Admin routes
router.get('/', verifyToken, isAdmin, bookingController.getAllBookings);

module.exports = router;

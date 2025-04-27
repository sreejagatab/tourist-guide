const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isGuide, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/tour/:tourId', reviewController.getTourReviews);

// User routes
router.get('/user', verifyToken, reviewController.getUserReviews);
router.post('/', verifyToken, reviewController.createReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);
router.post('/:id/helpful', verifyToken, reviewController.voteReviewHelpful);

// Guide/Admin routes
router.post('/:id/response', verifyToken, isGuide, reviewController.addReviewResponse);

module.exports = router;

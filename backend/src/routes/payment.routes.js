const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Create payment intent (requires authentication)
router.post('/create-payment-intent', verifyToken, paymentController.createPaymentIntent);

// Stripe webhook (no authentication required as it's called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;

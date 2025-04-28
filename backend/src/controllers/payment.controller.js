const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51NXJUmLkdIwIDF7KNBvQDVxGYKA8N1vGHEXBeI9xLOjZdUMrGMQUlQQYLcIQQK3mTCOc4OMOYFLzQyHbAYMBQHBT00Ij7qqgGI');
const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');
const encryption = require('../utils/encryption');

// Create a payment intent for Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { tourId, numberOfPeople, bikeRentalDetails } = req.body;

    if (!tourId || !numberOfPeople) {
      return res.status(400).json({ message: 'Tour ID and number of people are required' });
    }

    // Get tour details
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Calculate amount
    let amount = tour.price * numberOfPeople;

    // Add bike rental cost if applicable
    if (tour.type === 'bike' && bikeRentalDetails && bikeRentalDetails.rented && tour.bikeRental?.available) {
      amount += (tour.bikeRental.price || 0) * (bikeRentalDetails.quantity || 0);
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: tour.currency.toLowerCase() || 'usd',
      metadata: {
        tourId: tour._id.toString(),
        userId: req.user._id.toString(),
        numberOfPeople,
        bikeRentalDetails: JSON.stringify(bikeRentalDetails || {})
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: tour.currency
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Webhook to handle Stripe events
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

// Handle successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const { tourId, userId, numberOfPeople, bikeRentalDetails } = paymentIntent.metadata;

    // Parse bikeRentalDetails
    const parsedBikeRentalDetails = JSON.parse(bikeRentalDetails);

    // Get tour details
    const tour = await Tour.findById(tourId);
    if (!tour) {
      console.error('Tour not found for payment:', tourId);
      return;
    }

    // Calculate total amount
    let totalAmount = tour.price * parseInt(numberOfPeople);

    // Add bike rental cost if applicable
    if (tour.type === 'bike' && parsedBikeRentalDetails.rented && tour.bikeRental?.available) {
      totalAmount += (tour.bikeRental.price || 0) * (parsedBikeRentalDetails.quantity || 0);
    }

    // Create booking with encrypted payment details
    const booking = new Booking({
      tour: tourId,
      user: userId,
      price: tour.price,
      date: new Date(parsedBikeRentalDetails.date || Date.now()),
      numberOfPeople: parseInt(numberOfPeople),
      totalAmount,
      status: 'confirmed',
      paymentId: paymentIntent.id,
      paymentMethod: 'stripe',
      // Encrypt sensitive payment details
      paymentDetails: encryption.encrypt(JSON.stringify({
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentIntent.payment_method,
        last4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4,
        brand: paymentIntent.charges?.data[0]?.payment_method_details?.card?.brand,
        expiryMonth: paymentIntent.charges?.data[0]?.payment_method_details?.card?.exp_month,
        expiryYear: paymentIntent.charges?.data[0]?.payment_method_details?.card?.exp_year,
        timestamp: new Date().toISOString()
      })),
      bikeRentalDetails: parsedBikeRentalDetails.rented ? {
        rented: true,
        bikeType: parsedBikeRentalDetails.bikeType,
        quantity: parsedBikeRentalDetails.quantity,
        rentalPrice: tour.bikeRental?.price || 0
      } : undefined
    });

    await booking.save();
    console.log('Booking created successfully:', booking._id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Handle failed payment
const handleFailedPayment = async (paymentIntent) => {
  try {
    console.log('Payment failed:', paymentIntent.id);
    // You could log this to a database or send a notification
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

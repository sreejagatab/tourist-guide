const User = require('../models/user.model');
const Tour = require('../models/tour.model');
const Itinerary = require('../models/itinerary.model');
const mongoose = require('mongoose');

// Get user's favorite tours
exports.getFavoriteTours = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedTours')
      .select('savedTours');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ tours: user.savedTours });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a tour to favorites
exports.addTourToFavorites = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Check if tour is already in favorites
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.savedTours.includes(tourId)) {
      return res.status(400).json({ message: 'Tour already in favorites' });
    }
    
    // Add tour to favorites
    user.savedTours.push(tourId);
    await user.save();
    
    res.json({ message: 'Tour added to favorites', tourId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a tour from favorites
exports.removeTourFromFavorites = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Remove tour from favorites
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.savedTours.includes(tourId)) {
      return res.status(400).json({ message: 'Tour not in favorites' });
    }
    
    user.savedTours = user.savedTours.filter(id => id.toString() !== tourId);
    await user.save();
    
    res.json({ message: 'Tour removed from favorites', tourId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if a tour is in favorites
exports.checkTourInFavorites = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Check if tour is in favorites
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFavorite = user.savedTours.some(id => id.toString() === tourId);
    
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's favorite itineraries
exports.getFavoriteItineraries = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedItineraries')
      .select('savedItineraries');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ itineraries: user.savedItineraries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add an itinerary to favorites
exports.addItineraryToFavorites = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    
    // Check if itinerary exists
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Check if itinerary is already in favorites
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.savedItineraries.includes(itineraryId)) {
      return res.status(400).json({ message: 'Itinerary already in favorites' });
    }
    
    // Add itinerary to favorites
    user.savedItineraries.push(itineraryId);
    await user.save();
    
    res.json({ message: 'Itinerary added to favorites', itineraryId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove an itinerary from favorites
exports.removeItineraryFromFavorites = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    
    // Check if itinerary exists
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Remove itinerary from favorites
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.savedItineraries.includes(itineraryId)) {
      return res.status(400).json({ message: 'Itinerary not in favorites' });
    }
    
    user.savedItineraries = user.savedItineraries.filter(id => id.toString() !== itineraryId);
    await user.save();
    
    res.json({ message: 'Itinerary removed from favorites', itineraryId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

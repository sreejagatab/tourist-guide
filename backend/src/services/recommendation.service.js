const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');
const Favorite = require('../models/favorite.model');
const Review = require('../models/review.model');

/**
 * Service for generating tour recommendations based on user preferences and behavior
 */
class RecommendationService {
  /**
   * Get personalized tour recommendations for a user
   * @param {string} userId - The user ID
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended tours
   */
  async getPersonalizedRecommendations(userId, limit = 5) {
    try {
      // Get user's booking history
      const userBookings = await Booking.find({ user: userId })
        .populate('tour')
        .lean();

      // Get user's favorites
      const userFavorites = await Favorite.find({ user: userId })
        .populate('tour')
        .lean();

      // Get user's reviews
      const userReviews = await Review.find({ user: userId })
        .populate('tour')
        .lean();

      // Extract user preferences
      const preferences = this.extractUserPreferences(userBookings, userFavorites, userReviews);

      // Get recommendations based on preferences
      const recommendations = await this.findRecommendedTours(userId, preferences, limit);

      return recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Extract user preferences from their history
   * @param {Array} bookings - User's booking history
   * @param {Array} favorites - User's favorite tours
   * @param {Array} reviews - User's tour reviews
   * @returns {Object} - User preferences
   */
  extractUserPreferences(bookings, favorites, reviews) {
    const preferences = {
      tourTypes: {},
      difficulties: {},
      priceRange: { min: 0, max: 1000, preferred: 0 },
      durations: {},
      locations: {},
      averageRating: 0,
      totalInteractions: 0
    };

    // Process bookings (strongest preference indicator)
    bookings.forEach(booking => {
      if (booking.tour) {
        this.updatePreferenceCount(preferences.tourTypes, booking.tour.type, 3);
        this.updatePreferenceCount(preferences.difficulties, booking.tour.difficulty, 3);
        this.updatePreferenceCount(preferences.durations, this.categorizeDuration(booking.tour.duration), 3);
        
        if (booking.tour.startLocation && booking.tour.startLocation.address) {
          this.updatePreferenceCount(preferences.locations, booking.tour.startLocation.address, 3);
        }
        
        preferences.priceRange.preferred += booking.tour.price;
        preferences.totalInteractions += 3;
      }
    });

    // Process favorites (strong preference indicator)
    favorites.forEach(favorite => {
      if (favorite.tour) {
        this.updatePreferenceCount(preferences.tourTypes, favorite.tour.type, 2);
        this.updatePreferenceCount(preferences.difficulties, favorite.tour.difficulty, 2);
        this.updatePreferenceCount(preferences.durations, this.categorizeDuration(favorite.tour.duration), 2);
        
        if (favorite.tour.startLocation && favorite.tour.startLocation.address) {
          this.updatePreferenceCount(preferences.locations, favorite.tour.startLocation.address, 2);
        }
        
        preferences.priceRange.preferred += favorite.tour.price;
        preferences.totalInteractions += 2;
      }
    });

    // Process reviews (preference indicator based on rating)
    reviews.forEach(review => {
      if (review.tour) {
        const weight = review.rating >= 4 ? 2 : (review.rating >= 3 ? 1 : 0);
        
        if (weight > 0) {
          this.updatePreferenceCount(preferences.tourTypes, review.tour.type, weight);
          this.updatePreferenceCount(preferences.difficulties, review.tour.difficulty, weight);
          this.updatePreferenceCount(preferences.durations, this.categorizeDuration(review.tour.duration), weight);
          
          if (review.tour.startLocation && review.tour.startLocation.address) {
            this.updatePreferenceCount(preferences.locations, review.tour.startLocation.address, weight);
          }
          
          preferences.priceRange.preferred += review.tour.price;
          preferences.totalInteractions += weight;
        }
        
        preferences.averageRating += review.rating;
      }
    });

    // Calculate average price preference
    if (preferences.totalInteractions > 0) {
      preferences.priceRange.preferred = Math.round(preferences.priceRange.preferred / preferences.totalInteractions);
    }

    // Calculate average rating
    if (reviews.length > 0) {
      preferences.averageRating = preferences.averageRating / reviews.length;
    }

    // Set price range based on preferred price
    preferences.priceRange.min = Math.max(0, preferences.priceRange.preferred * 0.7);
    preferences.priceRange.max = preferences.priceRange.preferred * 1.3;

    return preferences;
  }

  /**
   * Update the count of a preference
   * @param {Object} preferenceObj - The preference object to update
   * @param {string} key - The preference key
   * @param {number} weight - The weight to add
   */
  updatePreferenceCount(preferenceObj, key, weight) {
    if (!key) return;
    
    if (!preferenceObj[key]) {
      preferenceObj[key] = weight;
    } else {
      preferenceObj[key] += weight;
    }
  }

  /**
   * Categorize tour duration into short, medium, or long
   * @param {number} minutes - Duration in minutes
   * @returns {string} - Duration category
   */
  categorizeDuration(minutes) {
    if (minutes <= 60) return 'short';
    if (minutes <= 180) return 'medium';
    return 'long';
  }

  /**
   * Find tours that match user preferences
   * @param {string} userId - The user ID
   * @param {Object} preferences - User preferences
   * @param {number} limit - Maximum number of recommendations
   * @returns {Promise<Array>} - Array of recommended tours
   */
  async findRecommendedTours(userId, preferences, limit) {
    try {
      // Get tours the user has already booked
      const userBookings = await Booking.find({ user: userId }).distinct('tour');
      
      // Get top preferred tour types
      const preferredTypes = Object.entries(preferences.tourTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);
      
      // Get top preferred difficulties
      const preferredDifficulties = Object.entries(preferences.difficulties)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);

      // Build query for recommended tours
      const query = {
        _id: { $nin: userBookings }, // Exclude already booked tours
        $or: [
          { type: { $in: preferredTypes } },
          { difficulty: { $in: preferredDifficulties } },
          { price: { 
            $gte: preferences.priceRange.min, 
            $lte: preferences.priceRange.max 
          }}
        ],
        ratingsAverage: { $gte: Math.min(preferences.averageRating, 4) }
      };

      // Find recommended tours
      const recommendedTours = await Tour.find(query)
        .sort({ ratingsAverage: -1 })
        .limit(limit)
        .lean();

      // Calculate relevance score for each tour
      const scoredRecommendations = recommendedTours.map(tour => {
        let score = 0;
        
        // Score based on tour type
        if (preferences.tourTypes[tour.type]) {
          score += preferences.tourTypes[tour.type];
        }
        
        // Score based on difficulty
        if (preferences.difficulties[tour.difficulty]) {
          score += preferences.difficulties[tour.difficulty];
        }
        
        // Score based on duration
        const durationCategory = this.categorizeDuration(tour.duration);
        if (preferences.durations[durationCategory]) {
          score += preferences.durations[durationCategory];
        }
        
        // Score based on price proximity to preferred price
        const priceDiff = Math.abs(tour.price - preferences.priceRange.preferred);
        const priceScore = 5 - Math.min(5, priceDiff / 20);
        score += priceScore;
        
        // Score based on rating
        score += tour.ratingsAverage;
        
        return {
          ...tour,
          relevanceScore: score
        };
      });

      // Sort by relevance score and return
      return scoredRecommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding recommended tours:', error);
      throw error;
    }
  }

  /**
   * Get popular tours for new users or as fallback
   * @param {number} limit - Maximum number of tours to return
   * @returns {Promise<Array>} - Array of popular tours
   */
  async getPopularTours(limit = 5) {
    try {
      return await Tour.find({
        ratingsAverage: { $gte: 4 }
      })
        .sort({ ratingsQuantity: -1, ratingsAverage: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting popular tours:', error);
      throw error;
    }
  }

  /**
   * Get similar tours to a specific tour
   * @param {string} tourId - The tour ID
   * @param {number} limit - Maximum number of similar tours
   * @returns {Promise<Array>} - Array of similar tours
   */
  async getSimilarTours(tourId, limit = 4) {
    try {
      const tour = await Tour.findById(tourId);
      
      if (!tour) {
        throw new Error('Tour not found');
      }
      
      const similarTours = await Tour.find({
        _id: { $ne: tourId },
        $or: [
          { type: tour.type },
          { difficulty: tour.difficulty },
          { 
            price: { 
              $gte: tour.price * 0.7, 
              $lte: tour.price * 1.3 
            } 
          }
        ]
      })
        .sort({ ratingsAverage: -1 })
        .limit(limit)
        .lean();
      
      return similarTours;
    } catch (error) {
      console.error('Error getting similar tours:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationService();

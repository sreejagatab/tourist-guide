const recommendationService = require('../services/recommendation.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get personalized tour recommendations for the authenticated user
 */
exports.getPersonalizedRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  
  // Get recommendations
  const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
  
  res.status(200).json({
    status: 'success',
    results: recommendations.length,
    data: {
      recommendations
    }
  });
});

/**
 * Get popular tours for new users or as fallback
 */
exports.getPopularTours = catchAsync(async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  
  // Get popular tours
  const popularTours = await recommendationService.getPopularTours(limit);
  
  res.status(200).json({
    status: 'success',
    results: popularTours.length,
    data: {
      tours: popularTours
    }
  });
});

/**
 * Get similar tours to a specific tour
 */
exports.getSimilarTours = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 4;
  
  if (!tourId) {
    return next(new AppError('Tour ID is required', 400));
  }
  
  // Get similar tours
  const similarTours = await recommendationService.getSimilarTours(tourId, limit);
  
  res.status(200).json({
    status: 'success',
    results: similarTours.length,
    data: {
      tours: similarTours
    }
  });
});

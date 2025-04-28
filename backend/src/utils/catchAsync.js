/**
 * Wrapper function to catch async errors in route handlers
 * This eliminates the need for try/catch blocks in each controller
 * 
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

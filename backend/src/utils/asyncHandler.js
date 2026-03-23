/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

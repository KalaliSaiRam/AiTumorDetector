const apiResponse = require('../utils/apiResponse');

/**
 * Role-based access control middleware factory.
 *
 * Usage: requireRole('ADMIN', 'DOCTOR')
 *
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiResponse.error('Not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          apiResponse.error(
            `Access denied. Required role: ${roles.join(' or ')}.`
          )
        );
    }

    next();
  };
};

/**
 * Only verified doctors (isVerified = true) can access protected routes.
 * Use AFTER authenticate + requireRole('DOCTOR').
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified && req.user.role === 'DOCTOR') {
    return res
      .status(403)
      .json(
        apiResponse.error(
          'Your account is pending admin verification. Please wait for approval.'
        )
      );
  }
  next();
};

module.exports = { requireRole, requireVerified };

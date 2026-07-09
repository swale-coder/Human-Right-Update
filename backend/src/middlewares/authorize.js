const ApiError = require('../utils/ApiError')

/**
 * Restricts a route to one or more roles.
 * Usage: router.get('/admin', authenticate, authorize('SUPER_ADMIN', 'NATIONAL_ADMIN'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'))
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'))
    }
    next()
  }
}

module.exports = authorize

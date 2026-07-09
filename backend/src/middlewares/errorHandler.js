const logger = require('../config/logger')
const ApiError = require('../utils/ApiError')

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409
    message = `Duplicate value for: ${err.meta?.target?.join(', ') || 'unique field'}`
  }

  if (!statusCode) statusCode = 500
  if (!message) message = 'Internal server error'

  if (!(err instanceof ApiError) && process.env.NODE_ENV !== 'test') {
    logger.error(err.stack || err.message)
  } else if (statusCode >= 500) {
    logger.error(err.stack || err.message)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  })
}

module.exports = { notFound, errorHandler }

const ApiError = require('../utils/ApiError')
const { verifyAccessToken } = require('../utils/jwt')
const prisma = require('../config/prisma')
const asyncHandler = require('../utils/asyncHandler')

/**
 * Verifies the Bearer access token and attaches the authenticated user to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token missing')
  }

  const token = header.split(' ')[1]

  let decoded
  try {
    decoded = verifyAccessToken(token)
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token')
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } })
  if (!user) {
    throw new ApiError(401, 'User no longer exists')
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active. Contact an administrator.')
  }

  req.user = user
  next()
})

module.exports = authenticate

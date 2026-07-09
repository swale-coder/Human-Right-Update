const { verifyAccessToken } = require('../utils/jwt')
const prisma = require('../config/prisma')
const asyncHandler = require('../utils/asyncHandler')

/**
 * Attaches req.user if a valid access token is present, but does not
 * reject the request if it's missing or invalid. Used for endpoints
 * that support both guest and logged-in flows (e.g. online donations).
 */
const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1]
    try {
      const decoded = verifyAccessToken(token)
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } })
      if (user && user.status === 'ACTIVE') {
        req.user = user
      }
    } catch {
      // ignore invalid/expired token for optional auth
    }
  }
  next()
})

module.exports = optionalAuthenticate

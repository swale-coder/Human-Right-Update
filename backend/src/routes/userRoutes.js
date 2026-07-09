const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')
const prisma = require('../config/prisma')
const authService = require('../services/authService')

const router = express.Router()

router.use(authenticate)

/**
 * List users — restricted to admin roles.
 * Demonstrates the authorize() RBAC middleware for future phases.
 */
router.get(
  '/',
  authorize('SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN'),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ])

    res.json({
      success: true,
      users: users.map(authService.sanitizeUser),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })
)

module.exports = router

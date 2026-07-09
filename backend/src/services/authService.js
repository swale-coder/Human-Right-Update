const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} = require('../utils/jwt')

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user
  return rest
}

async function issueTokens(user) {
  const payload = { sub: user.id, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  })

  return { accessToken, refreshToken }
}

async function register({ fullName, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  })

  await prisma.activityLog.create({
    data: { userId: user.id, action: 'REGISTER', details: 'New member registered' },
  })

  return sanitizeUser(user)
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Your account is not active. Please contact an administrator.')
  }

  const tokens = await issueTokens(user)

  await prisma.activityLog.create({
    data: { userId: user.id, action: 'LOGIN' },
  })

  return { user: sanitizeUser(user), ...tokens }
}

async function refresh(refreshToken) {
  let decoded
  try {
    decoded = verifyRefreshToken(refreshToken)
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token is no longer valid. Please log in again.')
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } })
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'User no longer active')
  }

  // Rotate refresh token: revoke the old one, issue a fresh pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  })

  const tokens = await issueTokens(user)
  return tokens
}

async function logout(refreshToken) {
  if (!refreshToken) return
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  })
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  // Always behave the same way whether or not the user exists (avoid email enumeration)
  if (!user) return

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({
    data: { token, userId: user.id, expiresAt },
  })

  // NOTE: Phase 1 logs the reset link instead of sending a real email.
  // Wire this into an email provider (e.g. SMTP, SendGrid) in a later phase.
  // eslint-disable-next-line no-console
  console.log(`[Password Reset] Link for ${email}: /reset-password?token=${token}`)
}

async function resetPassword(token, newPassword) {
  const resetRecord = await prisma.passwordReset.findUnique({ where: { token } })
  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    throw new ApiError(400, 'This reset link is invalid or has expired')
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
    // Revoke all existing refresh tokens for security
    prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId },
      data: { revoked: true },
    }),
  ])
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

module.exports = {
  sanitizeUser,
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
}

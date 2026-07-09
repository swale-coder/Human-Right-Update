const jwt = require('jsonwebtoken')

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  })
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  })
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

function getRefreshTokenExpiryDate() {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  const match = /^(\d+)([smhd])$/.exec(expiresIn)
  const value = match ? Number(match[1]) : 7
  const unit = match ? match[2] : 'd'
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return new Date(Date.now() + value * multipliers[unit])
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
}

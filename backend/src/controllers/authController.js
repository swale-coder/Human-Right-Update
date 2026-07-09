const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/authService')

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body)
  res.status(201).json({ success: true, message: 'Registration successful', user })
})

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body)
  res.status(200).json({ success: true, message: 'Login successful', user, accessToken, refreshToken })
})

const refreshToken = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken)
  res.status(200).json({ success: true, ...tokens })
})

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken)
  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email)
  res.status(200).json({
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  })
})

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password)
  res.status(200).json({ success: true, message: 'Password has been reset successfully' })
})

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword)
  res.status(200).json({ success: true, message: 'Password updated successfully' })
})

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: authService.sanitizeUser(req.user) })
})

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
}

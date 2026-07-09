const express = require('express')
const authController = require('../controllers/authController')
const authenticate = require('../middlewares/authenticate')
const validate = require('../middlewares/validate')
const { authLimiter } = require('../middlewares/rateLimiter')
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  refreshTokenValidator,
} = require('../validators/authValidators')

const router = express.Router()

router.post('/register', authLimiter, registerValidator, validate, authController.register)
router.post('/login', authLimiter, loginValidator, validate, authController.login)
router.post('/refresh-token', refreshTokenValidator, validate, authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword)
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword)

router.use(authenticate)
router.get('/profile', authController.getProfile)
router.post('/change-password', changePasswordValidator, validate, authController.changePassword)

module.exports = router

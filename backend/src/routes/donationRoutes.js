const express = require('express')
const donationController = require('../controllers/donationController')
const authenticate = require('../middlewares/authenticate')
const optionalAuthenticate = require('../middlewares/optionalAuthenticate')
const authorize = require('../middlewares/authorize')
const validate = require('../middlewares/validate')
const {
  createOrderValidator,
  verifyPaymentValidator,
  offlineDonationValidator,
  listDonationsValidator,
} = require('../validators/donationValidators')

const router = express.Router()

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

// Public/guest-friendly online donation flow
router.post('/online/create-order', optionalAuthenticate, createOrderValidator, validate, donationController.createOrder)
router.post('/online/verify', optionalAuthenticate, verifyPaymentValidator, validate, donationController.verifyPayment)

// Everything below requires login
router.use(authenticate)

router.get('/mine', donationController.getMine)
router.get('/:id/receipt', donationController.receipt)
router.get('/:id/80g-receipt', donationController.receipt80G)

// Admin only
router.post('/offline', authorize(...ADMIN_ROLES), offlineDonationValidator, validate, donationController.recordOffline)
router.get('/', authorize(...ADMIN_ROLES), listDonationsValidator, validate, donationController.list)
router.get('/reports/summary', authorize(...ADMIN_ROLES), donationController.summary)
router.get('/:id', authorize(...ADMIN_ROLES), donationController.getOne)

module.exports = router

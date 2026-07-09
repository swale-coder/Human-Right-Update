const { body, query } = require('express-validator')

const createOrderValidator = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('donorName').trim().notEmpty().withMessage('Donor name is required'),
  body('donorEmail').optional().isEmail().withMessage('Invalid email'),
  body('donorPhone').optional().trim(),
  body('purpose').optional().trim(),
  body('isRecurring').optional().isBoolean().toBoolean(),
  body('recurringFrequency').optional().isIn(['NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
]

const verifyPaymentValidator = [
  body('razorpayOrderId').notEmpty().withMessage('Order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Signature is required'),
]

const offlineDonationValidator = [
  body('donorName').trim().notEmpty().withMessage('Donor name is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('donorEmail').optional().isEmail().withMessage('Invalid email'),
  body('donorPhone').optional().trim(),
  body('panNumber').optional().trim(),
  body('purpose').optional().trim(),
  body('donatedAt').optional().isISO8601(),
]

const listDonationsValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']),
  query('mode').optional().isIn(['ONLINE', 'OFFLINE']),
]

module.exports = {
  createOrderValidator,
  verifyPaymentValidator,
  offlineDonationValidator,
  listDonationsValidator,
}

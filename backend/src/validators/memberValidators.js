const { body, query } = require('express-validator')

const applyMembershipValidator = [
  body('membershipType')
    .optional()
    .isIn(['GENERAL', 'LIFE', 'HONORARY', 'STUDENT'])
    .withMessage('Invalid membership type'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('address').optional().trim(),
  body('state').optional().trim(),
  body('district').optional().trim(),
  body('taluka').optional().trim(),
  body('city').optional().trim(),
  body('pincode').optional().trim(),
  body('fatherOrSpouseName').optional().trim(),
  body('occupation').optional().trim(),
]

const updateMemberValidator = [...applyMembershipValidator]

const rejectMemberValidator = [
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
]

const listMembersValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'RENEWAL_PENDING']),
]

module.exports = {
  applyMembershipValidator,
  updateMemberValidator,
  rejectMemberValidator,
  listMembersValidator,
}

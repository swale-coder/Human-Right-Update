const express = require('express')
const memberController = require('../controllers/memberController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')
const validate = require('../middlewares/validate')
const upload = require('../middlewares/upload')
const {
  applyMembershipValidator,
  updateMemberValidator,
  rejectMemberValidator,
  listMembersValidator,
} = require('../validators/memberValidators')

const router = express.Router()

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

// Public: verify a membership card by its number (e.g. scanned via QR)
router.get('/verify/:membershipNumber', memberController.verify)

router.use(authenticate)

// Self-service
router.post('/apply', applyMembershipValidator, validate, memberController.apply)
router.get('/me', memberController.getMine)

// Admin listing
router.get('/', authorize(...ADMIN_ROLES), listMembersValidator, validate, memberController.list)

// Single member (owner or admin checks happen in the service layer where relevant)
router.get('/:id', memberController.getOne)
router.patch('/:id', updateMemberValidator, validate, memberController.update)
router.delete('/:id', authorize(...ADMIN_ROLES), memberController.remove)

router.post('/:id/photo', upload.single('photo'), memberController.uploadPhoto)
router.post('/:id/document', upload.single('document'), memberController.uploadDocument)

router.post('/:id/approve', authorize(...ADMIN_ROLES), memberController.approve)
router.post('/:id/reject', authorize(...ADMIN_ROLES), rejectMemberValidator, validate, memberController.reject)

router.post('/:id/request-renewal', memberController.requestRenewal)
router.post('/:id/approve-renewal', authorize(...ADMIN_ROLES), memberController.approveRenewal)

router.get('/:id/history', authorize(...ADMIN_ROLES), memberController.history)
router.get('/:id/certificate', memberController.certificate)
router.get('/:id/id-card', memberController.idCard)

module.exports = router

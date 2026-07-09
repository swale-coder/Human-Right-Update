const express = require('express')
const complaintController = require('../controllers/complaintController')
const authenticate = require('../middlewares/authenticate')
const optionalAuthenticate = require('../middlewares/optionalAuthenticate')
const authorize = require('../middlewares/authorize')
const validate = require('../middlewares/validate')
const upload = require('../middlewares/upload')
const {
  registerComplaintValidator,
  updateComplaintValidator,
  resolveComplaintValidator,
  addNoteValidator,
  listComplaintsValidator,
} = require('../validators/complaintValidators')

const router = express.Router()

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

// Public/guest-friendly complaint registration
router.post('/', optionalAuthenticate, registerComplaintValidator, validate, complaintController.register)

router.use(authenticate)

router.get('/mine', complaintController.getMine)

// Admin only (declared before /:id so they aren't shadowed)
router.get('/', authorize(...ADMIN_ROLES), listComplaintsValidator, validate, complaintController.list)
router.get('/reports/summary', authorize(...ADMIN_ROLES), complaintController.summary)

router.get('/:id', complaintController.getOne)
router.post('/:id/evidence', upload.single('evidence'), complaintController.uploadEvidence)
router.get('/:id/notes', complaintController.getNotes)

router.patch('/:id', authorize(...ADMIN_ROLES), updateComplaintValidator, validate, complaintController.update)
router.post('/:id/resolve', authorize(...ADMIN_ROLES), resolveComplaintValidator, validate, complaintController.resolve)
router.post('/:id/notes', authorize(...ADMIN_ROLES), addNoteValidator, validate, complaintController.addNote)

module.exports = router

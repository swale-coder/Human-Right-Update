const express = require('express')
const { body } = require('express-validator')
const controller = require('../controllers/beneficiaryController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')
const validate = require('../middlewares/validate')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.use(authenticate, authorize(...ADMIN_ROLES))

const createValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('supportType').isIn(['LEGAL', 'FINANCIAL', 'MEDICAL', 'EDUCATION', 'OTHER']).withMessage('Invalid support type'),
]

router.post('/', createValidator, validate, controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router

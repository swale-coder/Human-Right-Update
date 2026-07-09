const express = require('express')
const controller = require('../controllers/eventController')
const authenticate = require('../middlewares/authenticate')
const optionalAuthenticate = require('../middlewares/optionalAuthenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.get('/public', controller.listPublic)
router.post('/:id/register', optionalAuthenticate, controller.registerForEvent)
router.post('/registrations/:registrationId/feedback', controller.submitFeedback)
router.get('/:id/registrations/:registrationId/certificate', controller.certificate)

router.use(authenticate, authorize(...ADMIN_ROLES))
router.post('/', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)
router.post('/registrations/:registrationId/attendance', controller.markAttendance)

module.exports = router

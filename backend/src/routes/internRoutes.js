const express = require('express')
const controller = require('../controllers/internController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.use(authenticate)

router.post('/register', controller.register)
router.get('/mine', controller.getMine)
router.post('/:id/daily-report', controller.addDailyReport)
router.get('/:id/certificate', controller.certificate)

router.use(authorize(...ADMIN_ROLES))
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.post('/:id/approve', controller.approve)
router.post('/:id/reject', controller.reject)
router.post('/:id/mentor', controller.assignMentor)
router.post('/:id/attendance', controller.markAttendance)
router.post('/:id/evaluate', controller.evaluate)

module.exports = router

const express = require('express')
const controller = require('../controllers/volunteerController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.use(authenticate)

router.post('/register', controller.register)
router.get('/mine', controller.getMine)
router.get('/:id/certificate', controller.certificate)

router.use(authorize(...ADMIN_ROLES))
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.post('/:id/approve', controller.approve)
router.post('/:id/reject', controller.reject)
router.post('/:id/attendance', controller.markAttendance)
router.post('/:id/tasks', controller.assignTask)
router.patch('/tasks/:taskId', controller.updateTaskStatus)

module.exports = router

const express = require('express')
const controller = require('../controllers/superAdminController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()

// Super/National admins manage org structure & roles
router.use(authenticate, authorize('SUPER_ADMIN', 'NATIONAL_ADMIN'))

router.post('/states', controller.createState)
router.get('/states', controller.listStates)
router.post('/districts', controller.createDistrict)
router.get('/districts', controller.listDistricts)
router.post('/talukas', controller.createTaluka)
router.get('/talukas', controller.listTalukas)
router.post('/cities', controller.createCity)
router.get('/cities', controller.listCities)

router.patch('/users/:userId/role', controller.updateUserRole)
router.patch('/users/:userId/status', controller.updateUserStatus)

router.get('/activity-logs', controller.listActivityLogs)

router.get('/settings', controller.getSettings)
router.put('/settings', controller.updateSetting)

module.exports = router

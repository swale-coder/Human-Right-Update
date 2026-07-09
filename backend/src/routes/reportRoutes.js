const express = require('express')
const controller = require('../controllers/reportController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.use(authenticate, authorize(...ADMIN_ROLES))

router.get('/dashboard', controller.dashboard)
router.get('/export/:module', controller.exportExcel)

module.exports = router

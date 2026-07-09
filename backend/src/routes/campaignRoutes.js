const express = require('express')
const controller = require('../controllers/campaignController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']

router.get('/public', controller.listPublic)
router.get('/public/:id', controller.getOne)

router.use(authenticate, authorize(...ADMIN_ROLES))
router.post('/', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id', controller.update)
router.post('/:id/updates', controller.addUpdate)
router.delete('/:id', controller.remove)

module.exports = router

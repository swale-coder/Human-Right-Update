const express = require('express')
const controller = require('../controllers/humanRightsLinkController')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')

const router = express.Router()
const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN']

// Public directory — anyone visiting the site can see verified human rights resources
router.get('/public', controller.listPublic)

router.use(authenticate, authorize(...ADMIN_ROLES))
router.post('/', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router

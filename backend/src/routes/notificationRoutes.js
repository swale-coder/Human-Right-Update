const express = require('express')
const controller = require('../controllers/notificationController')
const authenticate = require('../middlewares/authenticate')

const router = express.Router()

router.use(authenticate)
router.get('/', controller.list)
router.patch('/:id/read', controller.markRead)
router.patch('/read-all', controller.markAllRead)

module.exports = router

const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/notificationService')

const list = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query
  const result = await service.listForUser(req.user.id, { page, limit, unreadOnly })
  res.json({ success: true, ...result })
})

const markRead = asyncHandler(async (req, res) => {
  const notification = await service.markRead(req.params.id, req.user.id)
  res.json({ success: true, notification })
})

const markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user.id)
  res.json({ success: true, message: 'All notifications marked as read' })
})

module.exports = { list, markRead, markAllRead }

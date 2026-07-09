const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

async function notifyUser(userId, { type = 'INFO', title, message, link = null }) {
  return prisma.notification.create({ data: { userId, type, title, message, link } })
}

async function listForUser(userId, { page = 1, limit = 20, unreadOnly }) {
  const skip = (page - 1) * limit
  const where = { userId, ...(unreadOnly === 'true' ? { isRead: false } : {}) }
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])
  return { notifications, unreadCount, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function markRead(id, userId) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) throw new ApiError(404, 'Notification not found')
  return prisma.notification.update({ where: { id }, data: { isRead: true } })
}

async function markAllRead(userId) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
}

module.exports = { notifyUser, listForUser, markRead, markAllRead }

const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const { uploadBuffer } = require('./uploadService')

async function create(createdById, payload) {
  return prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description || null,
      location: payload.location || null,
      startAt: new Date(payload.startAt),
      endAt: payload.endAt ? new Date(payload.endAt) : null,
      capacity: payload.capacity ? Number(payload.capacity) : null,
      createdById,
    },
  })
}

async function list({ page = 1, limit = 20, status }) {
  const skip = (page - 1) * limit
  const where = status ? { status } : {}
  const [events, total] = await Promise.all([
    prisma.event.findMany({ where, orderBy: { startAt: 'desc' }, skip, take: limit, include: { _count: { select: { registrations: true } } } }),
    prisma.event.count({ where }),
  ])
  return { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function listPublic() {
  return prisma.event.findMany({
    where: { status: { in: ['UPCOMING', 'ONGOING'] } },
    orderBy: { startAt: 'asc' },
  })
}

async function getById(id) {
  const event = await prisma.event.findUnique({ where: { id }, include: { registrations: true } })
  if (!event) throw new ApiError(404, 'Event not found')
  return event
}

async function update(id, payload) {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw new ApiError(404, 'Event not found')
  return prisma.event.update({
    where: { id },
    data: {
      title: payload.title ?? event.title,
      description: payload.description ?? event.description,
      location: payload.location ?? event.location,
      startAt: payload.startAt ? new Date(payload.startAt) : event.startAt,
      endAt: payload.endAt ? new Date(payload.endAt) : event.endAt,
      capacity: payload.capacity ? Number(payload.capacity) : event.capacity,
      status: payload.status ?? event.status,
    },
  })
}

async function remove(id) {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw new ApiError(404, 'Event not found')
  await prisma.event.delete({ where: { id } })
}

async function registerForEvent(eventId, userId, payload, baseUrl) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { registrations: true } } } })
  if (!event) throw new ApiError(404, 'Event not found')
  if (event.capacity && event._count.registrations >= event.capacity) {
    throw new ApiError(400, 'This event has reached full capacity')
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      userId: userId || null,
      attendeeName: payload.attendeeName,
      attendeeEmail: payload.attendeeEmail || null,
      attendeePhone: payload.attendeePhone || null,
    },
  })

  const QRCode = require('qrcode')
  const qrBuffer = await QRCode.toBuffer(registration.id, { type: 'png', width: 250 })
  const qrCodeUrl = await uploadBuffer(qrBuffer, 'events/qrcodes', `${registration.id}.png`, baseUrl)

  return prisma.eventRegistration.update({ where: { id: registration.id }, data: { qrCodeUrl } })
}

async function markAttendanceByQr(registrationId) {
  const registration = await prisma.eventRegistration.findUnique({ where: { id: registrationId } })
  if (!registration) throw new ApiError(404, 'Registration not found')
  return prisma.eventRegistration.update({ where: { id: registrationId }, data: { attended: true } })
}

async function submitFeedback(registrationId, feedback, rating) {
  const registration = await prisma.eventRegistration.findUnique({ where: { id: registrationId } })
  if (!registration) throw new ApiError(404, 'Registration not found')
  return prisma.eventRegistration.update({ where: { id: registrationId }, data: { feedback, rating } })
}

module.exports = { create, list, listPublic, getById, update, remove, registerForEvent, markAttendanceByQr, submitFeedback }

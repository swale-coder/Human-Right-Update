const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const eventService = require('../services/eventService')
const { streamGenericCertificate } = require('../utils/genericCertificateGenerator')

function getBaseUrl(req) { return `${req.protocol}://${req.get('host')}` }

const create = asyncHandler(async (req, res) => {
  const event = await eventService.create(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Event created', event })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query
  const result = await eventService.list({ page, limit, status })
  res.json({ success: true, ...result })
})

const listPublic = asyncHandler(async (req, res) => {
  const events = await eventService.listPublic()
  res.json({ success: true, events })
})

const getOne = asyncHandler(async (req, res) => {
  const event = await eventService.getById(req.params.id)
  res.json({ success: true, event })
})

const update = asyncHandler(async (req, res) => {
  const event = await eventService.update(req.params.id, req.body)
  res.json({ success: true, message: 'Event updated', event })
})

const remove = asyncHandler(async (req, res) => {
  await eventService.remove(req.params.id)
  res.json({ success: true, message: 'Event deleted' })
})

const registerForEvent = asyncHandler(async (req, res) => {
  const registration = await eventService.registerForEvent(req.params.id, req.user?.id || null, req.body, getBaseUrl(req))
  res.status(201).json({ success: true, message: 'Registered for event', registration })
})

const markAttendance = asyncHandler(async (req, res) => {
  const registration = await eventService.markAttendanceByQr(req.params.registrationId)
  res.json({ success: true, message: 'Attendance marked', registration })
})

const submitFeedback = asyncHandler(async (req, res) => {
  const registration = await eventService.submitFeedback(req.params.registrationId, req.body.feedback, req.body.rating)
  res.json({ success: true, message: 'Feedback submitted', registration })
})

const certificate = asyncHandler(async (req, res) => {
  const event = await eventService.getById(req.params.id)
  const registration = event.registrations.find((r) => r.id === req.params.registrationId)
  if (!registration) throw new ApiError(404, 'Registration not found')
  if (!registration.attended) throw new ApiError(400, 'Certificate is only available after attendance is confirmed')
  streamGenericCertificate(res, {
    certificateTitle: 'CERTIFICATE OF PARTICIPATION',
    recipientName: registration.attendeeName,
    bodyText: `participated in "${event.title}" organized by the Human Rights Protection Council.`,
    refNumber: registration.id,
    filename: `event-certificate-${registration.id}.pdf`,
  })
})

module.exports = { create, list, listPublic, getOne, update, remove, registerForEvent, markAttendance, submitFeedback, certificate }

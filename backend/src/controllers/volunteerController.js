const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const volunteerService = require('../services/volunteerService')
const { streamGenericCertificate } = require('../utils/genericCertificateGenerator')

const register = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.register(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Volunteer application submitted', volunteer })
})

const getMine = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getMine(req.user.id)
  res.json({ success: true, volunteer })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query
  const result = await volunteerService.list({ page, limit, status })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getById(req.params.id)
  res.json({ success: true, volunteer })
})

const approve = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.approve(req.params.id, req.user.id)
  res.json({ success: true, message: 'Volunteer approved', volunteer })
})

const reject = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.reject(req.params.id, req.user.id)
  res.json({ success: true, message: 'Volunteer rejected', volunteer })
})

const markAttendance = asyncHandler(async (req, res) => {
  const record = await volunteerService.markAttendance(req.params.id, req.body.date, req.body.present, req.body.remarks)
  res.status(201).json({ success: true, record })
})

const assignTask = asyncHandler(async (req, res) => {
  const task = await volunteerService.assignTask(req.params.id, req.body)
  res.status(201).json({ success: true, task })
})

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await volunteerService.updateTaskStatus(req.params.taskId, req.body.status)
  res.json({ success: true, task })
})

const certificate = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getById(req.params.id)
  if (volunteer.status !== 'APPROVED') throw new ApiError(400, 'Certificate is only available for approved volunteers')
  streamGenericCertificate(res, {
    certificateTitle: 'CERTIFICATE OF VOLUNTEERING',
    recipientName: volunteer.user.fullName,
    bodyText: `has volunteered with the Human Rights Protection Council since ${new Date(volunteer.joinedAt).toLocaleDateString('en-IN')}, contributing meaningfully to our mission.`,
    refNumber: volunteer.id,
    filename: `volunteer-certificate-${volunteer.id}.pdf`,
  })
})

module.exports = { register, getMine, list, getOne, approve, reject, markAttendance, assignTask, updateTaskStatus, certificate }

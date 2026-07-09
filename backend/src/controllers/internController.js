const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const internService = require('../services/internService')
const { streamGenericCertificate } = require('../utils/genericCertificateGenerator')

const register = asyncHandler(async (req, res) => {
  const intern = await internService.register(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Internship application submitted', intern })
})

const getMine = asyncHandler(async (req, res) => {
  const intern = await internService.getMine(req.user.id)
  res.json({ success: true, intern })
})

const addDailyReport = asyncHandler(async (req, res) => {
  const report = await internService.addDailyReport(req.params.id, req.user.id, req.body.date, req.body.report)
  res.status(201).json({ success: true, report })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query
  const result = await internService.list({ page, limit, status })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const intern = await internService.getById(req.params.id)
  res.json({ success: true, intern })
})

const approve = asyncHandler(async (req, res) => {
  const intern = await internService.approve(req.params.id, req.body.mentorId)
  res.json({ success: true, message: 'Intern approved', intern })
})

const reject = asyncHandler(async (req, res) => {
  const intern = await internService.reject(req.params.id)
  res.json({ success: true, message: 'Intern rejected', intern })
})

const assignMentor = asyncHandler(async (req, res) => {
  const intern = await internService.assignMentor(req.params.id, req.body.mentorId)
  res.json({ success: true, message: 'Mentor assigned', intern })
})

const markAttendance = asyncHandler(async (req, res) => {
  const record = await internService.markAttendance(req.params.id, req.body.date, req.body.present)
  res.status(201).json({ success: true, record })
})

const evaluate = asyncHandler(async (req, res) => {
  const intern = await internService.evaluate(req.params.id, req.body.score, req.body.remarks)
  res.json({ success: true, message: 'Evaluation recorded', intern })
})

const certificate = asyncHandler(async (req, res) => {
  const intern = await internService.getById(req.params.id)
  if (intern.status !== 'COMPLETED') throw new ApiError(400, 'Certificate is only available for completed internships')
  streamGenericCertificate(res, {
    certificateTitle: 'CERTIFICATE OF INTERNSHIP COMPLETION',
    recipientName: intern.user.fullName,
    bodyText: `has successfully completed an internship with the Human Rights Protection Council${intern.institution ? ` while studying at ${intern.institution}` : ''}.`,
    refNumber: intern.id,
    filename: `internship-certificate-${intern.id}.pdf`,
  })
})

module.exports = { register, getMine, addDailyReport, list, getOne, approve, reject, assignMentor, markAttendance, evaluate, certificate }

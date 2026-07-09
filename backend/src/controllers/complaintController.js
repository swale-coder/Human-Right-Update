const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const complaintService = require('../services/complaintService')

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`
}

const register = asyncHandler(async (req, res) => {
  const complaint = await complaintService.registerComplaint(req.user?.id || null, req.body)
  res.status(201).json({ success: true, message: 'Complaint registered', complaint })
})

const uploadEvidence = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')
  const complaint = await complaintService.uploadEvidence(req.params.id, req.user, req.file, getBaseUrl(req))
  res.json({ success: true, message: 'Evidence uploaded', complaint })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, category, search } = req.query
  const result = await complaintService.listComplaints({ page, limit, status, priority, category, search })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id)
  complaintService.ensureCanView(complaint, req.user)
  res.json({ success: true, complaint })
})

const getMine = asyncHandler(async (req, res) => {
  const complaints = await complaintService.getMyComplaints(req.user.id)
  res.json({ success: true, complaints })
})

const update = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateComplaint(req.params.id, req.user.id, req.body)
  res.json({ success: true, message: 'Complaint updated', complaint })
})

const resolve = asyncHandler(async (req, res) => {
  const complaint = await complaintService.resolveComplaint(req.params.id, req.user.id, req.body.resolutionSummary)
  res.json({ success: true, message: 'Complaint resolved', complaint })
})

const addNote = asyncHandler(async (req, res) => {
  const note = await complaintService.addNote(req.params.id, req.user.id, req.body.note)
  res.status(201).json({ success: true, note })
})

const getNotes = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id)
  complaintService.ensureCanView(complaint, req.user)
  const notes = await complaintService.getNotes(req.params.id)
  res.json({ success: true, notes })
})

const summary = asyncHandler(async (req, res) => {
  const result = await complaintService.getSummary()
  res.json({ success: true, summary: result })
})

module.exports = {
  register,
  uploadEvidence,
  list,
  getOne,
  getMine,
  update,
  resolve,
  addNote,
  getNotes,
  summary,
}

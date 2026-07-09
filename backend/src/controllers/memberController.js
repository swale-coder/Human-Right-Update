const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const memberService = require('../services/memberService')
const { streamMembershipCertificate } = require('../utils/certificateGenerator')
const { streamMembershipIdCard } = require('../utils/idCardGenerator')

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`
}

const apply = asyncHandler(async (req, res) => {
  const member = await memberService.applyForMembership(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Membership application submitted', member })
})

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')
  const member = await memberService.uploadMemberAsset(
    req.params.id,
    req.user,
    'photo',
    req.file,
    getBaseUrl(req)
  )
  res.json({ success: true, message: 'Photo uploaded', member })
})

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded')
  const member = await memberService.uploadMemberAsset(
    req.params.id,
    req.user,
    'document',
    req.file,
    getBaseUrl(req)
  )
  res.json({ success: true, message: 'Document uploaded', member })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, search, state, district } = req.query
  const result = await memberService.listMembers({ page, limit, status, search, state, district })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id)
  res.json({ success: true, member })
})

const getMine = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id)
  res.json({ success: true, member })
})

const verify = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByMembershipNumber(req.params.membershipNumber)
  res.json({
    success: true,
    valid: member.status === 'APPROVED',
    member: {
      fullName: member.user.fullName,
      membershipNumber: member.membershipNumber,
      membershipType: member.membershipType,
      status: member.status,
      joinDate: member.joinDate,
      expiryDate: member.expiryDate,
      state: member.state,
      district: member.district,
    },
  })
})

const update = asyncHandler(async (req, res) => {
  const member = await memberService.updateMember(req.params.id, req.user, req.body)
  res.json({ success: true, message: 'Member updated', member })
})

const approve = asyncHandler(async (req, res) => {
  const member = await memberService.approveMember(req.params.id, req.user.id, getBaseUrl(req))
  res.json({ success: true, message: 'Membership approved', member })
})

const reject = asyncHandler(async (req, res) => {
  const member = await memberService.rejectMember(req.params.id, req.user.id, req.body.rejectionReason)
  res.json({ success: true, message: 'Membership rejected', member })
})

const requestRenewal = asyncHandler(async (req, res) => {
  const member = await memberService.requestRenewal(req.params.id, req.user)
  res.json({ success: true, message: 'Renewal requested', member })
})

const approveRenewal = asyncHandler(async (req, res) => {
  const member = await memberService.approveRenewal(req.params.id, req.user.id)
  res.json({ success: true, message: 'Renewal approved', member })
})

const remove = asyncHandler(async (req, res) => {
  await memberService.deleteMember(req.params.id, req.user.id)
  res.json({ success: true, message: 'Member deleted' })
})

const history = asyncHandler(async (req, res) => {
  const logs = await memberService.getMemberHistory(req.params.id)
  res.json({ success: true, history: logs })
})

const certificate = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id)
  if (member.status !== 'APPROVED') {
    throw new ApiError(400, 'Certificate is only available for approved members')
  }
  streamMembershipCertificate(res, member)
})

const idCard = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id)
  if (member.status !== 'APPROVED') {
    throw new ApiError(400, 'ID card is only available for approved members')
  }
  await streamMembershipIdCard(res, member)
})

module.exports = {
  apply,
  uploadPhoto,
  uploadDocument,
  list,
  getOne,
  getMine,
  verify,
  update,
  approve,
  reject,
  requestRenewal,
  approveRenewal,
  remove,
  history,
  certificate,
  idCard,
}

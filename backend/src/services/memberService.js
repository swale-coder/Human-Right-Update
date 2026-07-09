const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const { generateMembershipNumber } = require('../utils/membershipNumber')
const { generateMembershipQrBuffer } = require('../utils/qrcode')
const { uploadBuffer } = require('./uploadService')
const notificationService = require('./notificationService')

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

const MEMBER_INCLUDE = {
  user: {
    select: { id: true, fullName: true, email: true, phone: true, role: true, status: true },
  },
}

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}

async function applyForMembership(userId, payload) {
  const existing = await prisma.member.findUnique({ where: { userId } })
  if (existing) {
    throw new ApiError(409, 'You already have a membership application on file')
  }

  const member = await prisma.member.create({
    data: {
      userId,
      membershipType: payload.membershipType || 'GENERAL',
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
      gender: payload.gender || null,
      fatherOrSpouseName: payload.fatherOrSpouseName || null,
      occupation: payload.occupation || null,
      address: payload.address || null,
      state: payload.state || null,
      district: payload.district || null,
      taluka: payload.taluka || null,
      city: payload.city || null,
      pincode: payload.pincode || null,
      status: 'PENDING',
    },
    include: MEMBER_INCLUDE,
  })

  await prisma.activityLog.create({
    data: { userId, action: 'MEMBERSHIP_APPLIED', details: `Member ${member.id} applied` },
  })

  return member
}

async function uploadMemberAsset(memberId, requestingUser, field, file, baseUrl) {
  const member = await prisma.member.findUnique({ where: { id: memberId } })
  if (!member) throw new ApiError(404, 'Member not found')

  const isOwner = member.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to update this member')
  }

  const folder = field === 'photo' ? 'members/photos' : 'members/documents'
  const url = await uploadBuffer(file.buffer, folder, file.originalname, baseUrl)

  const dataKey = field === 'photo' ? 'photoUrl' : 'idProofUrl'
  const updated = await prisma.member.update({
    where: { id: memberId },
    data: { [dataKey]: url },
    include: MEMBER_INCLUDE,
  })

  return updated
}

async function listMembers({ page = 1, limit = 20, status, search, state, district }) {
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { status } : {}),
    ...(state ? { state } : {}),
    ...(district ? { district } : {}),
    ...(search
      ? {
          OR: [
            { membershipNumber: { contains: search, mode: 'insensitive' } },
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: MEMBER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.member.count({ where }),
  ])

  return {
    members,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

async function getMemberById(id) {
  const member = await prisma.member.findUnique({ where: { id }, include: MEMBER_INCLUDE })
  if (!member) throw new ApiError(404, 'Member not found')
  return member
}

async function getMemberByUserId(userId) {
  const member = await prisma.member.findUnique({ where: { userId }, include: MEMBER_INCLUDE })
  return member // null is a valid "no application yet" response
}

async function getMemberByMembershipNumber(membershipNumber) {
  const member = await prisma.member.findUnique({
    where: { membershipNumber },
    include: MEMBER_INCLUDE,
  })
  if (!member) throw new ApiError(404, 'No member found with this membership number')
  return member
}

async function updateMember(id, requestingUser, payload) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')

  const isOwner = member.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to update this member')
  }

  const updated = await prisma.member.update({
    where: { id },
    data: {
      membershipType: payload.membershipType ?? member.membershipType,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : member.dateOfBirth,
      gender: payload.gender ?? member.gender,
      fatherOrSpouseName: payload.fatherOrSpouseName ?? member.fatherOrSpouseName,
      occupation: payload.occupation ?? member.occupation,
      address: payload.address ?? member.address,
      state: payload.state ?? member.state,
      district: payload.district ?? member.district,
      taluka: payload.taluka ?? member.taluka,
      city: payload.city ?? member.city,
      pincode: payload.pincode ?? member.pincode,
    },
    include: MEMBER_INCLUDE,
  })

  await prisma.activityLog.create({
    data: { userId: requestingUser.id, action: 'MEMBER_UPDATED', details: `Member ${id} updated` },
  })

  return updated
}

function computeExpiryDate(membershipType, fromDate) {
  if (membershipType === 'LIFE' || membershipType === 'HONORARY') return null
  const expiry = new Date(fromDate)
  expiry.setFullYear(expiry.getFullYear() + 1)
  return expiry
}

async function approveMember(id, approvedById, baseUrl) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')
  if (member.status === 'APPROVED') throw new ApiError(400, 'Member is already approved')

  const membershipNumber = member.membershipNumber || (await generateMembershipNumber())
  const joinDate = member.joinDate || new Date()
  const expiryDate = computeExpiryDate(member.membershipType, joinDate)

  const qrBuffer = await generateMembershipQrBuffer(membershipNumber)
  const qrCodeUrl = await uploadBuffer(qrBuffer, 'members/qrcodes', `${membershipNumber}.png`, baseUrl)

  const updated = await prisma.member.update({
    where: { id },
    data: {
      status: 'APPROVED',
      membershipNumber,
      joinDate,
      expiryDate,
      qrCodeUrl,
      approvedAt: new Date(),
      approvedById,
      rejectionReason: null,
    },
    include: MEMBER_INCLUDE,
  })

  await Promise.all([
    prisma.user.update({ where: { id: member.userId }, data: { status: 'ACTIVE' } }),
    prisma.activityLog.create({
      data: {
        userId: approvedById,
        action: 'MEMBERSHIP_APPROVED',
        details: `Member ${id} approved as ${membershipNumber}`,
      },
    }),
  ])

  await notificationService.notifyUser(member.userId, {
    type: 'SUCCESS',
    title: 'Membership approved',
    message: `Congratulations! Your membership (${membershipNumber}) has been approved.`,
    link: '/dashboard/membership',
  })

  return updated
}

async function rejectMember(id, rejectedById, reason) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')

  const updated = await prisma.member.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
    include: MEMBER_INCLUDE,
  })

  await prisma.activityLog.create({
    data: { userId: rejectedById, action: 'MEMBERSHIP_REJECTED', details: `Member ${id}: ${reason}` },
  })

  await notificationService.notifyUser(member.userId, {
    type: 'WARNING',
    title: 'Membership application rejected',
    message: `Your membership application was rejected. Reason: ${reason}`,
    link: '/dashboard/membership',
  })

  return updated
}

async function requestRenewal(id, requestingUser) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')

  const isOwner = member.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to renew this membership')
  }
  if (member.status !== 'APPROVED' && member.status !== 'EXPIRED') {
    throw new ApiError(400, 'Only approved or expired memberships can request renewal')
  }

  const updated = await prisma.member.update({
    where: { id },
    data: { status: 'RENEWAL_PENDING' },
    include: MEMBER_INCLUDE,
  })

  await prisma.activityLog.create({
    data: { userId: requestingUser.id, action: 'RENEWAL_REQUESTED', details: `Member ${id}` },
  })

  return updated
}

async function approveRenewal(id, approvedById) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')
  if (member.status !== 'RENEWAL_PENDING') {
    throw new ApiError(400, 'This member does not have a pending renewal request')
  }

  const newJoinDate = new Date()
  const expiryDate = computeExpiryDate(member.membershipType, newJoinDate)

  const updated = await prisma.member.update({
    where: { id },
    data: { status: 'APPROVED', joinDate: newJoinDate, expiryDate },
    include: MEMBER_INCLUDE,
  })

  await prisma.activityLog.create({
    data: { userId: approvedById, action: 'MEMBERSHIP_RENEWED', details: `Member ${id}` },
  })

  return updated
}

async function deleteMember(id, requestingUserId) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')

  await prisma.member.delete({ where: { id } })

  await prisma.activityLog.create({
    data: { userId: requestingUserId, action: 'MEMBER_DELETED', details: `Member ${id}` },
  })
}

async function getMemberHistory(id) {
  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) throw new ApiError(404, 'Member not found')

  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [{ userId: member.userId }, { details: { contains: id } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return logs
}

module.exports = {
  isAdminRole,
  applyForMembership,
  uploadMemberAsset,
  listMembers,
  getMemberById,
  getMemberByUserId,
  getMemberByMembershipNumber,
  updateMember,
  approveMember,
  rejectMember,
  requestRenewal,
  approveRenewal,
  deleteMember,
  getMemberHistory,
}

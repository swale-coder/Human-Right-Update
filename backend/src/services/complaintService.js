const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const notificationService = require('./notificationService')
const { generateComplaintNumber } = require('../utils/complaintNumber')
const { uploadBuffer } = require('./uploadService')

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}

const COMPLAINT_INCLUDE = {
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  assignedOfficer: { select: { id: true, fullName: true, email: true, role: true } },
  evidences: true,
}

async function registerComplaint(userId, payload) {
  const complaintNumber = await generateComplaintNumber()

  const complaint = await prisma.complaint.create({
    data: {
      complaintNumber,
      userId: userId || null,
      complainantName: payload.complainantName,
      complainantEmail: payload.complainantEmail || null,
      complainantPhone: payload.complainantPhone || null,
      category: payload.category,
      description: payload.description,
      state: payload.state || null,
      district: payload.district || null,
      taluka: payload.taluka || null,
      city: payload.city || null,
      incidentLocation: payload.incidentLocation || null,
      incidentDate: payload.incidentDate ? new Date(payload.incidentDate) : null,
      status: 'REGISTERED',
      priority: 'MEDIUM',
    },
    include: COMPLAINT_INCLUDE,
  })

  await prisma.activityLog.create({
    data: {
      userId: userId || null,
      action: 'COMPLAINT_REGISTERED',
      details: `Complaint ${complaint.id} (${complaintNumber}) registered`,
    },
  })
  await prisma.complaintNote.create({
    data: { complaintId: complaint.id, authorId: userId || null, note: 'Complaint registered.' },
  })

  return complaint
}

async function uploadEvidence(complaintId, requestingUser, file, baseUrl) {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } })
  if (!complaint) throw new ApiError(404, 'Complaint not found')

  const isOwner = complaint.userId && complaint.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to add evidence to this complaint')
  }

  const url = await uploadBuffer(file.buffer, 'complaints/evidence', file.originalname, baseUrl)

  await prisma.complaintEvidence.create({
    data: { complaintId, fileUrl: url, uploadedById: requestingUser.id },
  })

  await prisma.complaintNote.create({
    data: { complaintId, authorId: requestingUser.id, note: 'Evidence uploaded.' },
  })

  return prisma.complaint.findUnique({ where: { id: complaintId }, include: COMPLAINT_INCLUDE })
}

async function listComplaints({ page = 1, limit = 20, status, priority, category, search }) {
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { complaintNumber: { contains: search, mode: 'insensitive' } },
            { complainantName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: COMPLAINT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ])

  return {
    complaints,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

async function getComplaintById(id) {
  const complaint = await prisma.complaint.findUnique({ where: { id }, include: COMPLAINT_INCLUDE })
  if (!complaint) throw new ApiError(404, 'Complaint not found')
  return complaint
}

async function getMyComplaints(userId) {
  return prisma.complaint.findMany({
    where: { userId },
    include: COMPLAINT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

function ensureCanView(complaint, requestingUser) {
  const isOwner = complaint.userId && complaint.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to view this complaint')
  }
}

async function updateComplaint(id, requestingUserId, payload) {
  const complaint = await prisma.complaint.findUnique({ where: { id } })
  if (!complaint) throw new ApiError(404, 'Complaint not found')

  if (payload.assignedOfficerId) {
    const officer = await prisma.user.findUnique({ where: { id: payload.assignedOfficerId } })
    if (!officer) throw new ApiError(400, 'Assigned officer not found')
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      status: payload.status ?? complaint.status,
      priority: payload.priority ?? complaint.priority,
      category: payload.category ?? complaint.category,
      assignedOfficerId: payload.assignedOfficerId ?? complaint.assignedOfficerId,
      assignedAdvocateName: payload.assignedAdvocateName ?? complaint.assignedAdvocateName,
    },
    include: COMPLAINT_INCLUDE,
  })

  const changeSummary = []
  if (payload.status && payload.status !== complaint.status) changeSummary.push(`status → ${payload.status}`)
  if (payload.priority && payload.priority !== complaint.priority) changeSummary.push(`priority → ${payload.priority}`)
  if (payload.assignedOfficerId && payload.assignedOfficerId !== complaint.assignedOfficerId) {
    changeSummary.push('officer assigned')
  }
  if (payload.assignedAdvocateName && payload.assignedAdvocateName !== complaint.assignedAdvocateName) {
    changeSummary.push(`advocate → ${payload.assignedAdvocateName}`)
  }

  await prisma.activityLog.create({
    data: { userId: requestingUserId, action: 'COMPLAINT_UPDATED', details: `Complaint ${id}: ${changeSummary.join(', ') || 'updated'}` },
  })
  if (changeSummary.length) {
    await prisma.complaintNote.create({
      data: { complaintId: id, authorId: requestingUserId, note: changeSummary.join(', ') },
    })
  }
  if (payload.status && payload.status !== complaint.status && complaint.userId) {
    await notificationService.notifyUser(complaint.userId, {
      type: 'INFO',
      title: 'Complaint status updated',
      message: `Your complaint ${complaint.complaintNumber || complaint.id} is now "${payload.status}".`,
      link: `/dashboard/complaints/${id}`,
    })
  }

  return updated
}

async function resolveComplaint(id, requestingUserId, resolutionSummary) {
  const complaint = await prisma.complaint.findUnique({ where: { id } })
  if (!complaint) throw new ApiError(404, 'Complaint not found')

  const updated = await prisma.complaint.update({
    where: { id },
    data: { status: 'RESOLVED', resolutionSummary, resolvedAt: new Date() },
    include: COMPLAINT_INCLUDE,
  })

  await prisma.complaintNote.create({
    data: { complaintId: id, authorId: requestingUserId, note: `Resolved: ${resolutionSummary}` },
  })
  await prisma.activityLog.create({
    data: { userId: requestingUserId, action: 'COMPLAINT_RESOLVED', details: `Complaint ${id} resolved` },
  })
  if (complaint.userId) {
    await notificationService.notifyUser(complaint.userId, {
      type: 'SUCCESS',
      title: 'Complaint resolved',
      message: `Your complaint ${complaint.complaintNumber || complaint.id} has been resolved.`,
      link: `/dashboard/complaints/${id}`,
    })
  }

  return updated
}

async function addNote(id, requestingUserId, note) {
  const complaint = await prisma.complaint.findUnique({ where: { id } })
  if (!complaint) throw new ApiError(404, 'Complaint not found')

  return prisma.complaintNote.create({
    data: { complaintId: id, authorId: requestingUserId, note },
  })
}

async function getNotes(id) {
  return prisma.complaintNote.findMany({
    where: { complaintId: id },
    orderBy: { createdAt: 'asc' },
  })
}

async function getSummary() {
  const complaints = await prisma.complaint.findMany()
  const byStatus = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})
  const byPriority = complaints.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1
    return acc
  }, {})
  const byCategory = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1
    return acc
  }, {})

  return { total: complaints.length, byStatus, byPriority, byCategory }
}

module.exports = {
  isAdminRole,
  registerComplaint,
  uploadEvidence,
  listComplaints,
  getComplaintById,
  getMyComplaints,
  ensureCanView,
  updateComplaint,
  resolveComplaint,
  addNote,
  getNotes,
  getSummary,
}

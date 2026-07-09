const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

const ADMIN_ROLES = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN']
function isAdminRole(role) { return ADMIN_ROLES.includes(role) }

const INCLUDE = { user: { select: { id: true, fullName: true, email: true, phone: true } } }

async function register(userId, payload) {
  const existing = await prisma.volunteer.findUnique({ where: { userId } })
  if (existing) throw new ApiError(409, 'You have already registered as a volunteer')
  const volunteer = await prisma.volunteer.create({
    data: { userId, skills: payload.skills || null, status: 'PENDING' },
    include: INCLUDE,
  })
  await prisma.activityLog.create({ data: { userId, action: 'VOLUNTEER_REGISTERED', details: volunteer.id } })
  return volunteer
}

async function getMine(userId) {
  return prisma.volunteer.findUnique({ where: { userId }, include: { ...INCLUDE, tasks: true, attendances: true } })
}

async function list({ page = 1, limit = 20, status }) {
  const skip = (page - 1) * limit
  const where = status ? { status } : {}
  const [volunteers, total] = await Promise.all([
    prisma.volunteer.findMany({ where, include: INCLUDE, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.volunteer.count({ where }),
  ])
  return { volunteers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function getById(id) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id }, include: { ...INCLUDE, tasks: true, attendances: true } })
  if (!volunteer) throw new ApiError(404, 'Volunteer not found')
  return volunteer
}

async function approve(id, approvedById) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id } })
  if (!volunteer) throw new ApiError(404, 'Volunteer not found')
  const updated = await prisma.volunteer.update({
    where: { id },
    data: { status: 'APPROVED', joinedAt: new Date(), approvedById },
    include: INCLUDE,
  })
  await prisma.activityLog.create({ data: { userId: approvedById, action: 'VOLUNTEER_APPROVED', details: id } })
  return updated
}

async function reject(id, rejectedById) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id } })
  if (!volunteer) throw new ApiError(404, 'Volunteer not found')
  const updated = await prisma.volunteer.update({ where: { id }, data: { status: 'REJECTED' }, include: INCLUDE })
  await prisma.activityLog.create({ data: { userId: rejectedById, action: 'VOLUNTEER_REJECTED', details: id } })
  return updated
}

async function markAttendance(id, date, present, remarks) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id } })
  if (!volunteer) throw new ApiError(404, 'Volunteer not found')
  return prisma.volunteerAttendance.create({
    data: { volunteerId: id, date: new Date(date), present: Boolean(present), remarks: remarks || null },
  })
}

async function assignTask(id, payload) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id } })
  if (!volunteer) throw new ApiError(404, 'Volunteer not found')
  return prisma.volunteerTask.create({
    data: {
      volunteerId: id,
      title: payload.title,
      description: payload.description || null,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    },
  })
}

async function updateTaskStatus(taskId, status) {
  const task = await prisma.volunteerTask.findUnique({ where: { id: taskId } })
  if (!task) throw new ApiError(404, 'Task not found')
  return prisma.volunteerTask.update({ where: { id: taskId }, data: { status } })
}

module.exports = { isAdminRole, register, getMine, list, getById, approve, reject, markAttendance, assignTask, updateTaskStatus }

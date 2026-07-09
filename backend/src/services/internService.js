const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

const INCLUDE = { user: { select: { id: true, fullName: true, email: true, phone: true } } }

async function register(userId, payload) {
  const existing = await prisma.intern.findUnique({ where: { userId } })
  if (existing) throw new ApiError(409, 'You have already applied for an internship')
  const intern = await prisma.intern.create({
    data: {
      userId,
      institution: payload.institution || null,
      course: payload.course || null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      status: 'PENDING',
    },
    include: INCLUDE,
  })
  await prisma.activityLog.create({ data: { userId, action: 'INTERNSHIP_APPLIED', details: intern.id } })
  return intern
}

async function getMine(userId) {
  return prisma.intern.findUnique({ where: { userId }, include: { ...INCLUDE, reports: true, attendances: true } })
}

async function list({ page = 1, limit = 20, status }) {
  const skip = (page - 1) * limit
  const where = status ? { status } : {}
  const [interns, total] = await Promise.all([
    prisma.intern.findMany({ where, include: INCLUDE, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.intern.count({ where }),
  ])
  return { interns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function getById(id) {
  const intern = await prisma.intern.findUnique({ where: { id }, include: { ...INCLUDE, reports: true, attendances: true } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return intern
}

async function approve(id, mentorId) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return prisma.intern.update({ where: { id }, data: { status: 'APPROVED', mentorId: mentorId || intern.mentorId }, include: INCLUDE })
}

async function reject(id) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return prisma.intern.update({ where: { id }, data: { status: 'REJECTED' }, include: INCLUDE })
}

async function assignMentor(id, mentorId) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return prisma.intern.update({ where: { id }, data: { mentorId, status: 'ONGOING' }, include: INCLUDE })
}

async function addDailyReport(id, userId, date, report) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  if (intern.userId !== userId) throw new ApiError(403, 'You can only submit your own daily report')
  return prisma.internDailyReport.create({ data: { internId: id, date: new Date(date), report } })
}

async function markAttendance(id, date, present) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return prisma.internAttendance.create({ data: { internId: id, date: new Date(date), present: Boolean(present) } })
}

async function evaluate(id, score, remarks) {
  const intern = await prisma.intern.findUnique({ where: { id } })
  if (!intern) throw new ApiError(404, 'Intern not found')
  return prisma.intern.update({
    where: { id },
    data: { status: 'COMPLETED', evaluationScore: score, evaluationRemarks: remarks },
    include: INCLUDE,
  })
}

module.exports = { register, getMine, list, getById, approve, reject, assignMentor, addDailyReport, markAttendance, evaluate }

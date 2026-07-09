const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const { generateBeneficiaryCode } = require('../utils/beneficiaryCode')

async function create(recordedById, payload) {
  const beneficiaryCode = await generateBeneficiaryCode()
  const beneficiary = await prisma.beneficiary.create({
    data: {
      beneficiaryCode,
      fullName: payload.fullName,
      email: payload.email || null,
      phone: payload.phone || null,
      complaintId: payload.complaintId || null,
      supportType: payload.supportType,
      description: payload.description || null,
      state: payload.state || null,
      district: payload.district || null,
      city: payload.city || null,
      recordedById,
    },
  })
  await prisma.activityLog.create({
    data: { userId: recordedById, action: 'BENEFICIARY_REGISTERED', details: `Beneficiary ${beneficiary.id} (${beneficiaryCode})` },
  })
  return beneficiary
}

async function list({ page = 1, limit = 20, status, supportType, search }) {
  const skip = (page - 1) * limit
  const where = {
    ...(status ? { status } : {}),
    ...(supportType ? { supportType } : {}),
    ...(search
      ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { beneficiaryCode: { contains: search, mode: 'insensitive' } }] }
      : {}),
  }
  const [beneficiaries, total] = await Promise.all([
    prisma.beneficiary.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.beneficiary.count({ where }),
  ])
  return { beneficiaries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function getById(id) {
  const beneficiary = await prisma.beneficiary.findUnique({ where: { id } })
  if (!beneficiary) throw new ApiError(404, 'Beneficiary not found')
  return beneficiary
}

async function update(id, requestingUserId, payload) {
  const existing = await prisma.beneficiary.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Beneficiary not found')

  const updated = await prisma.beneficiary.update({
    where: { id },
    data: {
      status: payload.status ?? existing.status,
      description: payload.description ?? existing.description,
      assistanceAmount: payload.assistanceAmount ?? existing.assistanceAmount,
      documentUrl: payload.documentUrl ?? existing.documentUrl,
    },
  })
  await prisma.activityLog.create({
    data: { userId: requestingUserId, action: 'BENEFICIARY_UPDATED', details: `Beneficiary ${id} updated` },
  })
  return updated
}

async function remove(id) {
  const existing = await prisma.beneficiary.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Beneficiary not found')
  await prisma.beneficiary.delete({ where: { id } })
}

module.exports = { create, list, getById, update, remove }

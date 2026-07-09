const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

function slugify(title) {
  return `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`
}

async function create(createdById, payload) {
  return prisma.campaign.create({
    data: {
      title: payload.title,
      slug: slugify(payload.title),
      description: payload.description || null,
      goalAmount: payload.goalAmount,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      createdById,
    },
  })
}

async function list({ page = 1, limit = 20, status }) {
  const skip = (page - 1) * limit
  const where = status ? { status } : {}
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.campaign.count({ where }),
  ])

  const withTotals = await Promise.all(
    campaigns.map(async (c) => {
      const raised = await prisma.donation.aggregate({
        where: { campaignId: c.id, status: 'SUCCESS' },
        _sum: { amount: true },
      })
      return { ...c, raisedAmount: raised._sum.amount || 0 }
    })
  )

  return { campaigns: withTotals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function listPublic() {
  const campaigns = await prisma.campaign.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
  return Promise.all(
    campaigns.map(async (c) => {
      const raised = await prisma.donation.aggregate({ where: { campaignId: c.id, status: 'SUCCESS' }, _sum: { amount: true } })
      return { ...c, raisedAmount: raised._sum.amount || 0 }
    })
  )
}

async function getById(id) {
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { updates: { orderBy: { createdAt: 'desc' } } } })
  if (!campaign) throw new ApiError(404, 'Campaign not found')
  const raised = await prisma.donation.aggregate({ where: { campaignId: id, status: 'SUCCESS' }, _sum: { amount: true } })
  return { ...campaign, raisedAmount: raised._sum.amount || 0 }
}

async function update(id, payload) {
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) throw new ApiError(404, 'Campaign not found')
  return prisma.campaign.update({
    where: { id },
    data: {
      title: payload.title ?? campaign.title,
      description: payload.description ?? campaign.description,
      goalAmount: payload.goalAmount ?? campaign.goalAmount,
      endDate: payload.endDate ? new Date(payload.endDate) : campaign.endDate,
      status: payload.status ?? campaign.status,
    },
  })
}

async function addUpdate(id, title, content) {
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) throw new ApiError(404, 'Campaign not found')
  return prisma.campaignUpdate.create({ data: { campaignId: id, title, content } })
}

async function remove(id) {
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) throw new ApiError(404, 'Campaign not found')
  await prisma.campaign.delete({ where: { id } })
}

module.exports = { create, list, listPublic, getById, update, addUpdate, remove }

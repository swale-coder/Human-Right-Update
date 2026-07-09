const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

async function create(payload) {
  return prisma.humanRightsLink.create({
    data: {
      title: payload.title,
      category: payload.category,
      url: payload.url,
      description: payload.description || null,
      stateId: payload.stateId || null,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? 0,
    },
  })
}

async function list({ page = 1, limit = 50, category, stateId, isActive }) {
  const skip = (page - 1) * limit
  const where = {
    ...(category ? { category } : {}),
    ...(stateId ? { stateId } : {}),
    ...(isActive !== undefined ? { isActive: isActive === 'true' || isActive === true } : {}),
  }
  const [links, total] = await Promise.all([
    prisma.humanRightsLink.findMany({
      where,
      include: { state: { select: { id: true, name: true } } },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
      skip,
      take: Number(limit),
    }),
    prisma.humanRightsLink.count({ where }),
  ])
  return { links, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) || 1 } }
}

async function listPublic() {
  const links = await prisma.humanRightsLink.findMany({
    where: { isActive: true },
    include: { state: { select: { id: true, name: true } } },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
  })
  // Group by category for easy rendering on the public directory page
  return links.reduce((grouped, link) => {
    grouped[link.category] = grouped[link.category] || []
    grouped[link.category].push(link)
    return grouped
  }, {})
}

async function getById(id) {
  const link = await prisma.humanRightsLink.findUnique({ where: { id } })
  if (!link) throw new ApiError(404, 'Human rights link not found')
  return link
}

async function update(id, payload) {
  const link = await prisma.humanRightsLink.findUnique({ where: { id } })
  if (!link) throw new ApiError(404, 'Human rights link not found')
  return prisma.humanRightsLink.update({
    where: { id },
    data: {
      title: payload.title ?? link.title,
      category: payload.category ?? link.category,
      url: payload.url ?? link.url,
      description: payload.description ?? link.description,
      stateId: payload.stateId ?? link.stateId,
      isActive: payload.isActive ?? link.isActive,
      sortOrder: payload.sortOrder ?? link.sortOrder,
    },
  })
}

async function remove(id) {
  const link = await prisma.humanRightsLink.findUnique({ where: { id } })
  if (!link) throw new ApiError(404, 'Human rights link not found')
  await prisma.humanRightsLink.delete({ where: { id } })
}

module.exports = { create, list, listPublic, getById, update, remove }

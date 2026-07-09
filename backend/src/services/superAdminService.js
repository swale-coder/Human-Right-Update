const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')

// ---------- Organization hierarchy ----------
async function createState(name, code) {
  return prisma.state.create({ data: { name, code: code || null } })
}
async function listStates() {
  return prisma.state.findMany({ include: { _count: { select: { districts: true } } }, orderBy: { name: 'asc' } })
}
async function createDistrict(name, stateId) {
  const state = await prisma.state.findUnique({ where: { id: stateId } })
  if (!state) throw new ApiError(404, 'State not found')
  return prisma.district.create({ data: { name, stateId } })
}
async function listDistricts(stateId) {
  return prisma.district.findMany({ where: stateId ? { stateId } : {}, orderBy: { name: 'asc' } })
}
async function createTaluka(name, districtId) {
  const district = await prisma.district.findUnique({ where: { id: districtId } })
  if (!district) throw new ApiError(404, 'District not found')
  return prisma.taluka.create({ data: { name, districtId } })
}
async function listTalukas(districtId) {
  return prisma.taluka.findMany({ where: districtId ? { districtId } : {}, orderBy: { name: 'asc' } })
}
async function createCity(name, talukaId) {
  const taluka = await prisma.taluka.findUnique({ where: { id: talukaId } })
  if (!taluka) throw new ApiError(404, 'Taluka not found')
  return prisma.city.create({ data: { name, talukaId } })
}
async function listCities(talukaId) {
  return prisma.city.findMany({ where: talukaId ? { talukaId } : {}, orderBy: { name: 'asc' } })
}

// ---------- Role / permission management ----------
const VALID_ROLES = [
  'SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'TALUKA_ADMIN', 'CITY_ADMIN', 'VOLUNTEER', 'MEMBER',
]

async function updateUserRole(userId, role, geoScope = {}) {
  if (!VALID_ROLES.includes(role)) throw new ApiError(400, 'Invalid role')
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')

  return prisma.user.update({
    where: { id: userId },
    data: {
      role,
      stateId: geoScope.stateId ?? user.stateId,
      districtId: geoScope.districtId ?? user.districtId,
      talukaId: geoScope.talukaId ?? user.talukaId,
      cityId: geoScope.cityId ?? user.cityId,
    },
  })
}

async function updateUserStatus(userId, status) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')
  return prisma.user.update({ where: { id: userId }, data: { status } })
}

// ---------- Activity logs ----------
async function listActivityLogs({ page = 1, limit = 50, userId }) {
  const skip = (page - 1) * limit
  const where = userId ? { userId } : {}
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])
  return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

// ---------- System settings ----------
async function getSettings() {
  const settings = await prisma.systemSetting.findMany()
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
}

async function updateSetting(key, value) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

module.exports = {
  createState, listStates,
  createDistrict, listDistricts,
  createTaluka, listTalukas,
  createCity, listCities,
  updateUserRole, updateUserStatus,
  listActivityLogs,
  getSettings, updateSetting,
}

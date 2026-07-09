const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/superAdminService')

const createState = asyncHandler(async (req, res) => {
  const state = await service.createState(req.body.name, req.body.code)
  res.status(201).json({ success: true, state })
})
const listStates = asyncHandler(async (req, res) => {
  res.json({ success: true, states: await service.listStates() })
})
const createDistrict = asyncHandler(async (req, res) => {
  const district = await service.createDistrict(req.body.name, req.body.stateId)
  res.status(201).json({ success: true, district })
})
const listDistricts = asyncHandler(async (req, res) => {
  res.json({ success: true, districts: await service.listDistricts(req.query.stateId) })
})
const createTaluka = asyncHandler(async (req, res) => {
  const taluka = await service.createTaluka(req.body.name, req.body.districtId)
  res.status(201).json({ success: true, taluka })
})
const listTalukas = asyncHandler(async (req, res) => {
  res.json({ success: true, talukas: await service.listTalukas(req.query.districtId) })
})
const createCity = asyncHandler(async (req, res) => {
  const city = await service.createCity(req.body.name, req.body.talukaId)
  res.status(201).json({ success: true, city })
})
const listCities = asyncHandler(async (req, res) => {
  res.json({ success: true, cities: await service.listCities(req.query.talukaId) })
})

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await service.updateUserRole(req.params.userId, req.body.role, req.body)
  res.json({ success: true, message: 'Role updated', user })
})
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await service.updateUserStatus(req.params.userId, req.body.status)
  res.json({ success: true, message: 'Status updated', user })
})

const listActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit, userId } = req.query
  const result = await service.listActivityLogs({ page, limit, userId })
  res.json({ success: true, ...result })
})

const getSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, settings: await service.getSettings() })
})
const updateSetting = asyncHandler(async (req, res) => {
  const setting = await service.updateSetting(req.body.key, req.body.value)
  res.json({ success: true, setting })
})

module.exports = {
  createState, listStates,
  createDistrict, listDistricts,
  createTaluka, listTalukas,
  createCity, listCities,
  updateUserRole, updateUserStatus,
  listActivityLogs,
  getSettings, updateSetting,
}

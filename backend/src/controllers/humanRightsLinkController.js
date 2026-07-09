const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/humanRightsLinkService')

const create = asyncHandler(async (req, res) => {
  const link = await service.create(req.body)
  res.status(201).json({ success: true, message: 'Human rights link created', link })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, category, stateId, isActive } = req.query
  const result = await service.list({ page, limit, category, stateId, isActive })
  res.json({ success: true, ...result })
})

const listPublic = asyncHandler(async (req, res) => {
  const links = await service.listPublic()
  res.json({ success: true, links })
})

const getOne = asyncHandler(async (req, res) => {
  const link = await service.getById(req.params.id)
  res.json({ success: true, link })
})

const update = asyncHandler(async (req, res) => {
  const link = await service.update(req.params.id, req.body)
  res.json({ success: true, message: 'Human rights link updated', link })
})

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id)
  res.json({ success: true, message: 'Human rights link deleted' })
})

module.exports = { create, list, listPublic, getOne, update, remove }

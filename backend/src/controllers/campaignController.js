const asyncHandler = require('../utils/asyncHandler')
const campaignService = require('../services/campaignService')

const create = asyncHandler(async (req, res) => {
  const campaign = await campaignService.create(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Campaign created', campaign })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query
  const result = await campaignService.list({ page, limit, status })
  res.json({ success: true, ...result })
})

const listPublic = asyncHandler(async (req, res) => {
  const campaigns = await campaignService.listPublic()
  res.json({ success: true, campaigns })
})

const getOne = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getById(req.params.id)
  res.json({ success: true, campaign })
})

const update = asyncHandler(async (req, res) => {
  const campaign = await campaignService.update(req.params.id, req.body)
  res.json({ success: true, message: 'Campaign updated', campaign })
})

const addUpdate = asyncHandler(async (req, res) => {
  const update = await campaignService.addUpdate(req.params.id, req.body.title, req.body.content)
  res.status(201).json({ success: true, update })
})

const remove = asyncHandler(async (req, res) => {
  await campaignService.remove(req.params.id)
  res.json({ success: true, message: 'Campaign deleted' })
})

module.exports = { create, list, listPublic, getOne, update, addUpdate, remove }

const asyncHandler = require('../utils/asyncHandler')
const beneficiaryService = require('../services/beneficiaryService')

const create = asyncHandler(async (req, res) => {
  const beneficiary = await beneficiaryService.create(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Beneficiary registered', beneficiary })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, supportType, search } = req.query
  const result = await beneficiaryService.list({ page, limit, status, supportType, search })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const beneficiary = await beneficiaryService.getById(req.params.id)
  res.json({ success: true, beneficiary })
})

const update = asyncHandler(async (req, res) => {
  const beneficiary = await beneficiaryService.update(req.params.id, req.user.id, req.body)
  res.json({ success: true, message: 'Beneficiary updated', beneficiary })
})

const remove = asyncHandler(async (req, res) => {
  await beneficiaryService.remove(req.params.id)
  res.json({ success: true, message: 'Beneficiary deleted' })
})

module.exports = { create, list, getOne, update, remove }

const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const reportService = require('../services/reportService')
const { streamExcel } = require('../utils/excelExport')

const VALID_MODULES = ['members', 'donations', 'complaints', 'volunteers', 'interns', 'events', 'beneficiaries']

const dashboard = asyncHandler(async (req, res) => {
  const summary = await reportService.getDashboardSummary()
  res.json({ success: true, summary })
})

const exportExcel = asyncHandler(async (req, res) => {
  const { module } = req.params
  if (!VALID_MODULES.includes(module)) throw new ApiError(400, 'Invalid report module')
  const rows = await reportService.getModuleRows(module)
  await streamExcel(res, module, rows)
})

module.exports = { dashboard, exportExcel }

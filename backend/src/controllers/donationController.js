const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const donationService = require('../services/donationService')
const { streamDonationReceipt, stream80GReceipt } = require('../utils/donationReceiptGenerator')

const createOrder = asyncHandler(async (req, res) => {
  const result = await donationService.createOnlineOrder(req.user?.id || null, req.body)
  res.status(201).json({ success: true, ...result })
})

const verifyPayment = asyncHandler(async (req, res) => {
  const donation = await donationService.verifyOnlinePayment(req.body)
  res.json({ success: true, message: 'Payment verified', donation })
})

const recordOffline = asyncHandler(async (req, res) => {
  const donation = await donationService.recordOfflineDonation(req.user.id, req.body)
  res.status(201).json({ success: true, message: 'Offline donation recorded', donation })
})

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, mode, search } = req.query
  const result = await donationService.listDonations({ page, limit, status, mode, search })
  res.json({ success: true, ...result })
})

const getOne = asyncHandler(async (req, res) => {
  const donation = await donationService.getDonationById(req.params.id)
  res.json({ success: true, donation })
})

const getMine = asyncHandler(async (req, res) => {
  const donations = await donationService.getMyDonations(req.user.id)
  res.json({ success: true, donations })
})

const receipt = asyncHandler(async (req, res) => {
  const donation = await donationService.getDonationById(req.params.id)
  await donationService.ensureCanAccessReceipt(donation, req.user)
  streamDonationReceipt(res, donation)
})

const receipt80G = asyncHandler(async (req, res) => {
  const donation = await donationService.getDonationById(req.params.id)
  await donationService.ensureCanAccessReceipt(donation, req.user)
  if (!donation.panNumber) {
    throw new ApiError(400, 'PAN number is required on this donation for an 80G receipt')
  }
  stream80GReceipt(res, donation)
})

const summary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query
  const result = await donationService.getFinancialSummary({ startDate, endDate })
  res.json({ success: true, summary: result })
})

module.exports = {
  createOrder,
  verifyPayment,
  recordOffline,
  list,
  getOne,
  getMine,
  receipt,
  receipt80G,
  summary,
}

const crypto = require('crypto')
const prisma = require('../config/prisma')
const ApiError = require('../utils/ApiError')
const { razorpay, isConfigured: razorpayConfigured } = require('../config/razorpay')
const { generateReceiptNumber } = require('../utils/receiptNumber')

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'NATIONAL_ADMIN',
  'STATE_ADMIN',
  'DISTRICT_ADMIN',
  'TALUKA_ADMIN',
  'CITY_ADMIN',
]

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}

/**
 * Creates a Razorpay order and a PENDING Donation record.
 * If Razorpay isn't configured, falls back to a manual "pseudo-order" flow
 * so the feature is still testable without live keys.
 */
async function createOnlineOrder(userId, payload) {
  const amountInPaise = Math.round(Number(payload.amount) * 100)

  let razorpayOrderId = null

  if (razorpayConfigured) {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `hrpc_${Date.now()}`,
    })
    razorpayOrderId = order.id
  } else {
    // Dev fallback: generate a fake order id so the UI flow can still be tested
    razorpayOrderId = `dev_order_${crypto.randomBytes(8).toString('hex')}`
  }

  const donation = await prisma.donation.create({
    data: {
      userId: userId || null,
      donorName: payload.donorName,
      donorEmail: payload.donorEmail || null,
      donorPhone: payload.donorPhone || null,
      amount: payload.amount,
      mode: 'ONLINE',
      status: 'PENDING',
      purpose: payload.purpose || null,
      isRecurring: Boolean(payload.isRecurring),
      recurringFrequency: payload.isRecurring ? payload.recurringFrequency || 'MONTHLY' : 'NONE',
      razorpayOrderId,
      campaignId: payload.campaignId || null,
    },
  })

  return {
    donation,
    razorpayOrderId,
    amount: amountInPaise,
    currency: 'INR',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    isDevMode: !razorpayConfigured,
  }
}

/**
 * Verifies the Razorpay payment signature and marks the donation SUCCESS.
 * In dev mode (no Razorpay keys), skips signature verification.
 */
async function verifyOnlinePayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const donation = await prisma.donation.findUnique({ where: { razorpayOrderId } })
  if (!donation) throw new ApiError(404, 'Donation order not found')

  if (razorpayConfigured) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      await prisma.donation.update({ where: { id: donation.id }, data: { status: 'FAILED' } })
      throw new ApiError(400, 'Payment signature verification failed')
    }
  }

  const receiptNumber = await generateReceiptNumber()

  const updated = await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: 'SUCCESS',
      razorpayPaymentId,
      receiptNumber,
      donatedAt: new Date(),
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: donation.userId,
      action: 'DONATION_RECEIVED',
      details: `Donation ${updated.id} of ₹${updated.amount} confirmed`,
    },
  })

  return updated
}

async function recordOfflineDonation(recordedById, payload) {
  const receiptNumber = await generateReceiptNumber()

  const donation = await prisma.donation.create({
    data: {
      donorName: payload.donorName,
      donorEmail: payload.donorEmail || null,
      donorPhone: payload.donorPhone || null,
      panNumber: payload.panNumber || null,
      amount: payload.amount,
      mode: 'OFFLINE',
      status: 'SUCCESS',
      purpose: payload.purpose || null,
      isRecurring: Boolean(payload.isRecurring),
      recurringFrequency: payload.isRecurring ? payload.recurringFrequency || 'MONTHLY' : 'NONE',
      receiptNumber,
      recordedById,
      campaignId: payload.campaignId || null,
      donatedAt: payload.donatedAt ? new Date(payload.donatedAt) : new Date(),
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: recordedById,
      action: 'OFFLINE_DONATION_RECORDED',
      details: `Offline donation ${donation.id} of ₹${donation.amount} recorded`,
    },
  })

  return donation
}

async function listDonations({ page = 1, limit = 20, status, mode, search }) {
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { status } : {}),
    ...(mode ? { mode } : {}),
    ...(search
      ? {
          OR: [
            { donorName: { contains: search, mode: 'insensitive' } },
            { donorEmail: { contains: search, mode: 'insensitive' } },
            { receiptNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.donation.count({ where }),
  ])

  return {
    donations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

async function getDonationById(id) {
  const donation = await prisma.donation.findUnique({ where: { id } })
  if (!donation) throw new ApiError(404, 'Donation not found')
  return donation
}

async function getMyDonations(userId) {
  return prisma.donation.findMany({
    where: { userId, status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
  })
}

async function ensureCanAccessReceipt(donation, requestingUser) {
  const isOwner = donation.userId && donation.userId === requestingUser.id
  if (!isOwner && !isAdminRole(requestingUser.role)) {
    throw new ApiError(403, 'You do not have permission to access this receipt')
  }
  if (donation.status !== 'SUCCESS') {
    throw new ApiError(400, 'Receipt is only available for successful donations')
  }
}

async function getFinancialSummary({ startDate, endDate } = {}) {
  const where = {
    status: 'SUCCESS',
    ...(startDate || endDate
      ? {
          donatedAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  }

  const donations = await prisma.donation.findMany({ where })

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0)
  const totalCount = donations.length

  const byMode = donations.reduce((acc, d) => {
    acc[d.mode] = (acc[d.mode] || 0) + Number(d.amount)
    return acc
  }, {})

  const byMonth = donations.reduce((acc, d) => {
    const key = new Date(d.donatedAt).toISOString().slice(0, 7) // YYYY-MM
    acc[key] = (acc[key] || 0) + Number(d.amount)
    return acc
  }, {})

  const byPurpose = donations.reduce((acc, d) => {
    const key = d.purpose || 'General Donation'
    acc[key] = (acc[key] || 0) + Number(d.amount)
    return acc
  }, {})

  const recurringCount = donations.filter((d) => d.isRecurring).length

  return {
    totalAmount,
    totalCount,
    recurringCount,
    byMode,
    byMonth,
    byPurpose,
  }
}

module.exports = {
  isAdminRole,
  createOnlineOrder,
  verifyOnlinePayment,
  recordOfflineDonation,
  listDonations,
  getDonationById,
  getMyDonations,
  ensureCanAccessReceipt,
  getFinancialSummary,
}

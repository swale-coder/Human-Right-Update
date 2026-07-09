const prisma = require('../config/prisma')

/**
 * Generates a unique donation receipt number.
 * Format: HRPC-DN-{YEAR}-{6 digit sequence}
 */
async function generateReceiptNumber() {
  const year = new Date().getFullYear()
  const prefix = `HRPC-DN-${year}-`

  const countThisYear = await prisma.donation.count({
    where: { receiptNumber: { startsWith: prefix } },
  })

  const sequence = String(countThisYear + 1).padStart(6, '0')
  const candidate = `${prefix}${sequence}`

  const existing = await prisma.donation.findUnique({ where: { receiptNumber: candidate } })
  if (existing) {
    const fallbackSeq = String(countThisYear + Math.floor(Math.random() * 1000) + 1).padStart(6, '0')
    return `${prefix}${fallbackSeq}`
  }
  return candidate
}

module.exports = { generateReceiptNumber }

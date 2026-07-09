const prisma = require('../config/prisma')

/**
 * Generates a unique complaint/case number.
 * Format: HRPC-CMP-{YEAR}-{6 digit sequence}
 */
async function generateComplaintNumber() {
  const year = new Date().getFullYear()
  const prefix = `HRPC-CMP-${year}-`

  const countThisYear = await prisma.complaint.count({
    where: { complaintNumber: { startsWith: prefix } },
  })

  const sequence = String(countThisYear + 1).padStart(6, '0')
  const candidate = `${prefix}${sequence}`

  const existing = await prisma.complaint.findUnique({ where: { complaintNumber: candidate } })
  if (existing) {
    const fallbackSeq = String(countThisYear + Math.floor(Math.random() * 1000) + 1).padStart(6, '0')
    return `${prefix}${fallbackSeq}`
  }
  return candidate
}

module.exports = { generateComplaintNumber }

const prisma = require('../config/prisma')

/**
 * Generates a unique, human-readable membership number.
 * Format: HRPC-{YEAR}-{6 digit zero-padded sequence}
 * Sequence resets each calendar year.
 */
async function generateMembershipNumber() {
  const year = new Date().getFullYear()
  const prefix = `HRPC-${year}-`

  const countThisYear = await prisma.member.count({
    where: { membershipNumber: { startsWith: prefix } },
  })

  const sequence = String(countThisYear + 1).padStart(6, '0')
  const candidate = `${prefix}${sequence}`

  // Extremely unlikely collision, but guard against it anyway
  const existing = await prisma.member.findUnique({ where: { membershipNumber: candidate } })
  if (existing) {
    const fallbackSeq = String(countThisYear + Math.floor(Math.random() * 1000) + 1).padStart(6, '0')
    return `${prefix}${fallbackSeq}`
  }

  return candidate
}

module.exports = { generateMembershipNumber }

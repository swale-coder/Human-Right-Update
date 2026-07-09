const prisma = require('../config/prisma')

async function generateBeneficiaryCode() {
  const year = new Date().getFullYear()
  const prefix = `HRPC-BEN-${year}-`
  const count = await prisma.beneficiary.count({ where: { beneficiaryCode: { startsWith: prefix } } })
  return `${prefix}${String(count + 1).padStart(6, '0')}`
}

module.exports = { generateBeneficiaryCode }

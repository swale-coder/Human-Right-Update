const PDFDocument = require('pdfkit')

const GREEN = '#123E2D'
const GOLD = '#9C7A3A'

function formatAmount(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

function baseHeader(doc, title) {
  doc
    .lineWidth(2)
    .strokeColor(GOLD)
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .stroke()

  doc.moveDown(2)
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(GREEN)
    .text('HUMAN RIGHTS PROTECTION COUNCIL', { align: 'center' })
  doc.font('Helvetica').fontSize(11).fillColor(GOLD).text('(HRPC)', { align: 'center' })

  doc.moveDown(1)
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#211C18')
    .text(title, { align: 'center', underline: true })
  doc.moveDown(1.5)
}

function detailRow(doc, label, value) {
  const y = doc.y
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#211C18').text(label, 60, y, { width: 180 })
  doc.font('Helvetica').fontSize(11).fillColor('#211C18').text(value || '-', 250, y, { width: 280 })
  doc.moveDown(0.6)
}

/**
 * Streams a standard donation receipt PDF.
 */
function streamDonationReceipt(res, donation) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="receipt-${donation.receiptNumber}.pdf"`)
  doc.pipe(res)

  baseHeader(doc, 'DONATION RECEIPT')

  detailRow(doc, 'Receipt No:', donation.receiptNumber)
  detailRow(doc, 'Date:', new Date(donation.donatedAt || donation.createdAt).toLocaleDateString('en-IN'))
  detailRow(doc, 'Donor Name:', donation.donorName)
  detailRow(doc, 'Email:', donation.donorEmail)
  detailRow(doc, 'Phone:', donation.donorPhone)
  detailRow(doc, 'Amount:', formatAmount(donation.amount))
  detailRow(doc, 'Mode:', donation.mode)
  detailRow(doc, 'Purpose:', donation.purpose || 'General Donation')
  if (donation.isRecurring) {
    detailRow(doc, 'Recurring:', donation.recurringFrequency)
  }

  doc.moveDown(3)
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#555')
    .text(
      'This receipt acknowledges the donation received by the Human Rights Protection Council. Thank you for your generous support.',
      60,
      doc.y,
      { width: doc.page.width - 120, align: 'center' }
    )

  doc.moveDown(3)
  doc.fontSize(11).text('_______________________', 60, doc.y)
  doc.text('Authorized Signatory', 60, doc.y + 2)

  doc.end()
}

/**
 * Streams an 80G tax-exemption receipt PDF (requires PAN number on file).
 */
function stream80GReceipt(res, donation) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="80g-receipt-${donation.receiptNumber}.pdf"`)
  doc.pipe(res)

  baseHeader(doc, '80G TAX EXEMPTION RECEIPT')

  detailRow(doc, 'Receipt No:', donation.receiptNumber)
  detailRow(doc, 'Date:', new Date(donation.donatedAt || donation.createdAt).toLocaleDateString('en-IN'))
  detailRow(doc, 'Donor Name:', donation.donorName)
  detailRow(doc, 'PAN Number:', donation.panNumber)
  detailRow(doc, 'Amount Donated:', formatAmount(donation.amount))
  detailRow(doc, 'Mode of Payment:', donation.mode)
  detailRow(doc, '80G Registration No:', process.env.ORG_80G_REG_NO || 'To be filled by organization')

  doc.moveDown(3)
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#555')
    .text(
      'This donation is eligible for tax exemption under Section 80G of the Income Tax Act, 1961, ' +
        'subject to the limits and conditions prescribed therein.',
      60,
      doc.y,
      { width: doc.page.width - 120, align: 'center' }
    )

  doc.moveDown(3)
  doc.fontSize(11).text('_______________________', 60, doc.y)
  doc.text('Authorized Signatory', 60, doc.y + 2)

  doc.end()
}

module.exports = { streamDonationReceipt, stream80GReceipt }

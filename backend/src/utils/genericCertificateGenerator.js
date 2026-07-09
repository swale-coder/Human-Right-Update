const PDFDocument = require('pdfkit')

const GREEN = '#123E2D'
const GOLD = '#9C7A3A'

/**
 * Streams a generic certificate PDF. Used for Volunteer, Internship,
 * Event Participation, and Appreciation certificates (Phase 10 engine).
 *
 * @param {object} opts
 * @param {string} opts.certificateTitle - e.g. "CERTIFICATE OF APPRECIATION"
 * @param {string} opts.recipientName
 * @param {string} opts.bodyText - main certificate sentence
 * @param {string} [opts.refNumber]
 * @param {string} [opts.filename]
 */
function streamGenericCertificate(res, opts) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${opts.filename || 'certificate.pdf'}"`)
  doc.pipe(res)

  doc.lineWidth(3).strokeColor(GOLD).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke()
  doc.lineWidth(1).strokeColor(GREEN).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke()

  doc.moveDown(3)
  doc.font('Helvetica-Bold').fontSize(22).fillColor(GREEN).text('HUMAN RIGHTS PROTECTION COUNCIL', { align: 'center' })
  doc.font('Helvetica').fontSize(12).fillColor(GOLD).text('(HRPC)', { align: 'center' })

  doc.moveDown(1.5)
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#211C18').text(opts.certificateTitle, { align: 'center', underline: true })

  doc.moveDown(2)
  doc.font('Helvetica').fontSize(13).fillColor('#211C18').text('This is to certify that', { align: 'center' })

  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(20).fillColor(GREEN).text(opts.recipientName, { align: 'center' })

  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(13).fillColor('#211C18').text(opts.bodyText, { align: 'center' })

  if (opts.refNumber) {
    doc.moveDown(1)
    doc.fontSize(11).text(`Reference No: ${opts.refNumber}`, { align: 'center' })
  }

  doc.moveDown(4)
  const bottomY = doc.y
  doc.fontSize(11).text('_______________________', 80, bottomY).text('Authorized Signatory', 80, bottomY + 18)
  doc.fontSize(11).text(`Issued on: ${new Date().toLocaleDateString('en-IN')}`, doc.page.width - 280, bottomY, { width: 200, align: 'right' })

  doc.end()
}

module.exports = { streamGenericCertificate }

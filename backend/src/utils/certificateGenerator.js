const PDFDocument = require('pdfkit')

/**
 * Streams a membership certificate PDF directly to the given response.
 */
function streamMembershipCertificate(res, member) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="membership-certificate-${member.membershipNumber}.pdf"`
  )
  doc.pipe(res)

  const goldColor = '#9C7A3A'
  const greenColor = '#123E2D'

  // Decorative border
  doc
    .lineWidth(3)
    .strokeColor(goldColor)
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .stroke()
  doc
    .lineWidth(1)
    .strokeColor(greenColor)
    .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .stroke()

  doc.moveDown(3)
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(greenColor)
    .text('HUMAN RIGHTS PROTECTION COUNCIL', { align: 'center' })

  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor(goldColor)
    .text('(HRPC)', { align: 'center' })

  doc.moveDown(1.5)
  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#211C18')
    .text('CERTIFICATE OF MEMBERSHIP', { align: 'center', underline: true })

  doc.moveDown(2)
  doc
    .font('Helvetica')
    .fontSize(13)
    .fillColor('#211C18')
    .text('This is to certify that', { align: 'center' })

  doc.moveDown(0.5)
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(greenColor)
    .text(member.user.fullName, { align: 'center' })

  doc.moveDown(0.5)
  doc
    .font('Helvetica')
    .fontSize(13)
    .fillColor('#211C18')
    .text(
      `has been granted ${member.membershipType} membership of the Human Rights Protection Council, ` +
        `bearing Membership Number ${member.membershipNumber}.`,
      { align: 'center' }
    )

  doc.moveDown(2)

  const formattedJoinDate = member.joinDate
    ? new Date(member.joinDate).toLocaleDateString('en-IN')
    : '-'
  const formattedExpiry = member.expiryDate
    ? new Date(member.expiryDate).toLocaleDateString('en-IN')
    : 'Lifetime'

  doc
    .fontSize(11)
    .text(`Valid From: ${formattedJoinDate}        Valid Until: ${formattedExpiry}`, {
      align: 'center',
    })

  doc.moveDown(4)

  const bottomY = doc.y
  doc
    .fontSize(11)
    .text('_______________________', 80, bottomY)
    .text('Authorized Signatory', 80, bottomY + 18)

  doc
    .fontSize(11)
    .text(`Issued on: ${new Date().toLocaleDateString('en-IN')}`, doc.page.width - 280, bottomY, {
      width: 200,
      align: 'right',
    })

  doc.end()
}

module.exports = { streamMembershipCertificate }

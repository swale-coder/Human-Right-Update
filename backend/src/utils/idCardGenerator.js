const PDFDocument = require('pdfkit')
const https = require('https')
const http = require('http')
const { generateMembershipQrBuffer } = require('./qrcode')

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null)
    const client = url.startsWith('https') ? https : http
    client
      .get(url, (resp) => {
        if (resp.statusCode !== 200) {
          resp.resume()
          return resolve(null)
        }
        const chunks = []
        resp.on('data', (chunk) => chunks.push(chunk))
        resp.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', () => resolve(null))
  })
}

/**
 * Streams a printable digital ID card PDF (CR80 PVC card size: 3.375in x 2.125in)
 * with the member's photo and a verification QR code.
 */
async function streamMembershipIdCard(res, member) {
  const CARD_WIDTH = 3.375 * 72 // points
  const CARD_HEIGHT = 2.125 * 72

  const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="id-card-${member.membershipNumber}.pdf"`
  )
  doc.pipe(res)

  const greenColor = '#123E2D'
  const goldColor = '#9C7A3A'
  const cream = '#FBF7EF'

  // Background
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill(cream)

  // Header band
  doc.rect(0, 0, CARD_WIDTH, 36).fill(greenColor)
  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('HUMAN RIGHTS PROTECTION COUNCIL', 8, 7, { width: CARD_WIDTH - 16 })
  doc
    .font('Helvetica')
    .fontSize(7)
    .text('Member Identity Card', 8, 20)

  // Photo box
  const photoBuffer = await fetchImageBuffer(member.photoUrl)
  const photoX = 8
  const photoY = 42
  const photoW = 55
  const photoH = 65

  doc.rect(photoX, photoY, photoW, photoH).strokeColor(goldColor).lineWidth(1).stroke()
  if (photoBuffer) {
    try {
      doc.image(photoBuffer, photoX, photoY, { width: photoW, height: photoH })
    } catch {
      // ignore unsupported image, leave box empty
    }
  }

  // Member details
  const textX = photoX + photoW + 10
  let textY = photoY
  doc
    .fillColor('#211C18')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(member.user.fullName, textX, textY, { width: CARD_WIDTH - textX - 10 })

  textY += 16
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#211C18')
    .text(`ID: ${member.membershipNumber}`, textX, textY)

  textY += 11
  doc.text(`Type: ${member.membershipType}`, textX, textY)

  textY += 11
  const expiry = member.expiryDate
    ? new Date(member.expiryDate).toLocaleDateString('en-IN')
    : 'Lifetime'
  doc.text(`Valid Until: ${expiry}`, textX, textY)

  textY += 11
  if (member.state) {
    doc.text(`State: ${member.state}`, textX, textY)
  }

  // QR code
  const qrBuffer = await generateMembershipQrBuffer(member.membershipNumber)
  const qrSize = 50
  doc.image(qrBuffer, CARD_WIDTH - qrSize - 10, CARD_HEIGHT - qrSize - 8, {
    width: qrSize,
    height: qrSize,
  })

  doc
    .font('Helvetica')
    .fontSize(6)
    .fillColor(goldColor)
    .text('Scan to verify', CARD_WIDTH - qrSize - 12, CARD_HEIGHT - 10, { width: qrSize + 4 })

  doc.end()
}

module.exports = { streamMembershipIdCard }

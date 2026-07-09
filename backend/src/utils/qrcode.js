const QRCode = require('qrcode')

/**
 * Generates a QR code PNG buffer encoding a verification URL for the given membership number.
 */
async function generateMembershipQrBuffer(membershipNumber) {
  const verifyBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const verifyUrl = `${verifyBaseUrl}/verify-member/${membershipNumber}`

  return QRCode.toBuffer(verifyUrl, {
    type: 'png',
    width: 300,
    margin: 1,
    color: { dark: '#123E2D', light: '#FFFFFF' },
  })
}

module.exports = { generateMembershipQrBuffer }

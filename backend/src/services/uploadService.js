const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { cloudinary, isConfigured } = require('../config/cloudinary')

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true })
}

/**
 * Uploads a buffer either to Cloudinary (if credentials are configured)
 * or to local disk under /backend/uploads (served statically) as a fallback.
 * Always returns a publicly reachable URL.
 *
 * @param {Buffer} buffer
 * @param {string} folder - logical folder, e.g. 'members/photos'
 * @param {string} originalName - original filename (used for extension)
 * @param {string} [baseUrl] - request base URL, used to build local fallback URLs
 */
async function uploadBuffer(buffer, folder, originalName, baseUrl) {
  if (isConfigured) {
    const result = await cloudinary.uploader.upload(
      `data:application/octet-stream;base64,${buffer.toString('base64')}`,
      { folder: `hrpc-erp/${folder}`, resource_type: 'auto' }
    )
    return result.secure_url
  }

  // Local fallback
  const ext = path.extname(originalName) || ''
  const fileName = `${uuidv4()}${ext}`
  const folderPath = path.join(LOCAL_UPLOAD_DIR, folder)
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  fs.writeFileSync(path.join(folderPath, fileName), buffer)

  const base = baseUrl || `http://localhost:${process.env.PORT || 5000}`
  return `${base}/uploads/${folder}/${fileName}`
}

module.exports = { uploadBuffer, isCloudinaryConfigured: isConfigured }

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const xssClean = require('xss-clean')
const path = require('path')

const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const { apiLimiter } = require('./middlewares/rateLimiter')

const app = express()

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }))

// CORS - restrict to the configured client URL
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// Body parsing
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Sanitize input against XSS
app.use(xssClean())

// Serve locally-stored uploads (used as a fallback when Cloudinary isn't configured)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Rate limiting on all API routes
app.use('/api', apiLimiter)

// API routes
app.use('/api', routes)

// 404 + centralized error handler
app.use(notFound)
app.use(errorHandler)

module.exports = app

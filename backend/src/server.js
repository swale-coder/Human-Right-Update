require('dotenv').config()
const app = require('./app')
const logger = require('./config/logger')
const prisma = require('./config/prisma')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')

    const server = app.listen(PORT, () => {
      logger.info(`HRPC ERP API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    })

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`)
      server.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()

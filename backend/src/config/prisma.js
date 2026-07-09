// ---------------------------------------------------------------------------
// This project no longer requires a real database connection.
// `prisma` here is a drop-in, in-memory mock client that implements the
// subset of the Prisma Client API this codebase actually uses (findMany,
// findUnique, findFirst, create, update, updateMany, upsert, delete,
// deleteMany, count, aggregate, $transaction, include/select/where/orderBy).
//
// Every service/controller/route in this project imports `prisma` from this
// file exactly as before — nothing else in the backend had to change.
// Data lives in memory (see ./mockdb/store.js) and is re-seeded with rich
// demo data every time the server starts. Restarting the server resets data
// back to the seed state, which is intentional for a demo/MVP build.
//
// See backend/DATA_LAYER.md for details and demo login credentials.
// ---------------------------------------------------------------------------
const { db } = require('./mockdb/store')
const { buildMockPrismaClient } = require('./mockdb/client')

const prisma = buildMockPrismaClient(db)

module.exports = prisma

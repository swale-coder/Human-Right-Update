const crypto = require('crypto')
const { SCHEMA, CASCADE_RULES, DEFAULTS } = require('./schema')
const { deepClone, matchWhere, sortRecords, applyInclude, pick } = require('./helpers')

function uuid() {
  return crypto.randomUUID()
}

function resolveDefaults(modelName) {
  const raw = DEFAULTS[modelName] || {}
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = typeof v === 'function' ? v() : v
  }
  return out
}

function makePrismaKnownError(code, message, target) {
  const err = new Error(message)
  err.code = code
  err.meta = target ? { target } : undefined
  return err
}

function checkUniqueConstraints(db, modelName, data, excludeId) {
  const uniqueFields = (SCHEMA[modelName] && SCHEMA[modelName].unique) || []
  for (const field of uniqueFields) {
    const value = data[field]
    if (value === undefined || value === null) continue
    const clash = db[modelName].find((r) => r.id !== excludeId && r[field] === value)
    if (clash) {
      throw makePrismaKnownError('P2002', `Unique constraint failed on the field: \`${field}\``, [field])
    }
  }
}

function runCascade(db, modelName, deletedRecord) {
  const rules = CASCADE_RULES[modelName]
  if (!rules) return
  for (const rule of rules) {
    if (rule.action === 'cascade') {
      const toRemove = db[rule.model].filter((r) => r[rule.fk] === deletedRecord.id)
      if (toRemove.length) {
        db[rule.model] = db[rule.model].filter((r) => r[rule.fk] !== deletedRecord.id)
        toRemove.forEach((r) => runCascade(db, rule.model, r))
      }
    } else if (rule.action === 'setNull') {
      db[rule.model].forEach((r) => {
        if (r[rule.fk] === deletedRecord.id) r[rule.fk] = null
      })
    }
  }
}

function finalize(db, rec, args, modelName) {
  if (!rec) return rec
  let result = { ...rec }
  if (args && args.include) result = applyInclude(db, result, args.include, modelName)
  if (args && args.select) result = pick(result, args.select)
  return result
}

function createModelDelegate(db, modelName) {
  return {
    async findMany(args = {}) {
      let list = db[modelName].filter((r) => matchWhere(db, r, args.where, modelName))
      if (args.orderBy) list = sortRecords(list, args.orderBy)
      if (typeof args.skip === 'number') list = list.slice(args.skip)
      if (typeof args.take === 'number') list = list.slice(0, args.take)
      return deepClone(list.map((r) => finalize(db, r, args, modelName)))
    },

    async findFirst(args = {}) {
      let list = db[modelName].filter((r) => matchWhere(db, r, args.where, modelName))
      if (args.orderBy) list = sortRecords(list, args.orderBy)
      const rec = list[0]
      return rec ? deepClone(finalize(db, rec, args, modelName)) : null
    },

    async findUnique(args = {}) {
      const rec = db[modelName].find((r) => matchWhere(db, r, args.where, modelName))
      return rec ? deepClone(finalize(db, rec, args, modelName)) : null
    },

    async count(args = {}) {
      return db[modelName].filter((r) => matchWhere(db, r, args.where, modelName)).length
    },

    async create(args = {}) {
      const data = { ...resolveDefaults(modelName), ...args.data }
      checkUniqueConstraints(db, modelName, data)
      const rec = { id: uuid(), createdAt: new Date(), updatedAt: new Date(), ...data }
      db[modelName].push(rec)
      return deepClone(finalize(db, rec, args, modelName))
    },

    async createMany(args = {}) {
      const rows = args.data || []
      for (const row of rows) {
        const data = { ...resolveDefaults(modelName), ...row }
        checkUniqueConstraints(db, modelName, data)
        db[modelName].push({ id: uuid(), createdAt: new Date(), updatedAt: new Date(), ...data })
      }
      return { count: rows.length }
    },

    async update(args = {}) {
      const rec = db[modelName].find((r) => matchWhere(db, r, args.where, modelName))
      if (!rec) throw makePrismaKnownError('P2025', `${modelName} record not found`)
      checkUniqueConstraints(db, modelName, args.data || {}, rec.id)
      Object.assign(rec, args.data, { updatedAt: new Date() })
      return deepClone(finalize(db, rec, args, modelName))
    },

    async updateMany(args = {}) {
      const list = db[modelName].filter((r) => matchWhere(db, r, args.where, modelName))
      list.forEach((r) => Object.assign(r, args.data, { updatedAt: new Date() }))
      return { count: list.length }
    },

    async upsert(args = {}) {
      const rec = db[modelName].find((r) => matchWhere(db, r, args.where, modelName))
      if (rec) {
        Object.assign(rec, args.update, { updatedAt: new Date() })
        return deepClone(finalize(db, rec, args, modelName))
      }
      const data = { ...resolveDefaults(modelName), ...args.create }
      checkUniqueConstraints(db, modelName, data)
      const created = { id: uuid(), createdAt: new Date(), updatedAt: new Date(), ...data }
      db[modelName].push(created)
      return deepClone(finalize(db, created, args, modelName))
    },

    async delete(args = {}) {
      const idx = db[modelName].findIndex((r) => matchWhere(db, r, args.where, modelName))
      if (idx === -1) throw makePrismaKnownError('P2025', `${modelName} record not found`)
      const [rec] = db[modelName].splice(idx, 1)
      runCascade(db, modelName, rec)
      return deepClone(rec)
    },

    async deleteMany(args = {}) {
      const toDelete = db[modelName].filter((r) => matchWhere(db, r, args.where, modelName))
      const ids = new Set(toDelete.map((r) => r.id))
      db[modelName] = db[modelName].filter((r) => !ids.has(r.id))
      toDelete.forEach((r) => runCascade(db, modelName, r))
      return { count: toDelete.length }
    },

    async aggregate(args = {}) {
      const list = db[modelName].filter((r) => matchWhere(db, r, args.where, modelName))
      const result = {}
      if (args._sum) {
        result._sum = {}
        for (const field of Object.keys(args._sum)) {
          result._sum[field] = list.reduce((sum, r) => sum + (Number(r[field]) || 0), 0)
        }
      }
      if (args._avg) {
        result._avg = {}
        for (const field of Object.keys(args._avg)) {
          result._avg[field] = list.length
            ? list.reduce((sum, r) => sum + (Number(r[field]) || 0), 0) / list.length
            : 0
        }
      }
      if (args._min) {
        result._min = {}
        for (const field of Object.keys(args._min)) {
          result._min[field] = list.length ? list.reduce((m, r) => (r[field] < m ? r[field] : m), list[0][field]) : null
        }
      }
      if (args._max) {
        result._max = {}
        for (const field of Object.keys(args._max)) {
          result._max[field] = list.length ? list.reduce((m, r) => (r[field] > m ? r[field] : m), list[0][field]) : null
        }
      }
      if (args._count) {
        result._count = args._count === true ? list.length : {}
        if (args._count !== true) {
          for (const field of Object.keys(args._count)) {
            result._count[field] = list.filter((r) => r[field] !== null && r[field] !== undefined).length
          }
        }
      }
      return result
    },
  }
}

function buildMockPrismaClient(db) {
  const client = {}
  for (const modelName of Object.keys(SCHEMA)) {
    client[modelName] = createModelDelegate(db, modelName)
  }

  client.$connect = async () => {}
  client.$disconnect = async () => {}
  client.$transaction = async (arg) => {
    if (typeof arg === 'function') return arg(client)
    // Delegate calls in the array are plain in-memory operations that already
    // executed synchronously up to their first (nonexistent) await, so simply
    // awaiting them here mirrors real Prisma's "all succeed together" result.
    return Promise.all(arg)
  }

  return client
}

module.exports = { buildMockPrismaClient }

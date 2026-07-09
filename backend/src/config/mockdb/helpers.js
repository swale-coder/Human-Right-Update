const { SCHEMA } = require('./schema')

function deepClone(value) {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value.getTime())
  if (Array.isArray(value)) return value.map(deepClone)
  const out = {}
  for (const key of Object.keys(value)) out[key] = deepClone(value[key])
  return out
}

function toComparable(x) {
  if (x instanceof Date) return x.getTime()
  if (typeof x === 'number') return x
  if (typeof x === 'boolean') return x ? 1 : 0
  if (typeof x === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(x)) {
      const t = Date.parse(x)
      if (!Number.isNaN(t)) return t
    }
    if (x.trim() !== '' && !Number.isNaN(Number(x))) return Number(x)
    return x
  }
  return x
}

function valuesEqual(a, b) {
  if (a === undefined || a === null) return b === undefined || b === null
  if (b === undefined || b === null) return false
  return toComparable(a) === toComparable(b)
}

function matchFieldCondition(value, cond) {
  if (cond === null) return value === null || value === undefined
  if (typeof cond !== 'object' || cond instanceof Date) {
    return valuesEqual(value, cond)
  }
  return Object.entries(cond).every(([op, opVal]) => {
    switch (op) {
      case 'equals':
        return valuesEqual(value, opVal)
      case 'not':
        return typeof opVal === 'object' && opVal !== null
          ? !matchFieldCondition(value, opVal)
          : !valuesEqual(value, opVal)
      case 'in':
        return Array.isArray(opVal) && opVal.some((v) => valuesEqual(value, v))
      case 'notIn':
        return Array.isArray(opVal) && !opVal.some((v) => valuesEqual(value, v))
      case 'contains': {
        if (value === null || value === undefined) return false
        const hay = String(value)
        const needle = String(opVal)
        return cond.mode === 'insensitive'
          ? hay.toLowerCase().includes(needle.toLowerCase())
          : hay.includes(needle)
      }
      case 'startsWith': {
        if (value === null || value === undefined) return false
        const hay = String(value)
        const needle = String(opVal)
        return cond.mode === 'insensitive'
          ? hay.toLowerCase().startsWith(needle.toLowerCase())
          : hay.startsWith(needle)
      }
      case 'endsWith': {
        if (value === null || value === undefined) return false
        const hay = String(value)
        const needle = String(opVal)
        return cond.mode === 'insensitive'
          ? hay.toLowerCase().endsWith(needle.toLowerCase())
          : hay.endsWith(needle)
      }
      case 'gte':
        return value !== null && value !== undefined && toComparable(value) >= toComparable(opVal)
      case 'lte':
        return value !== null && value !== undefined && toComparable(value) <= toComparable(opVal)
      case 'gt':
        return value !== null && value !== undefined && toComparable(value) > toComparable(opVal)
      case 'lt':
        return value !== null && value !== undefined && toComparable(value) < toComparable(opVal)
      case 'mode':
        return true // handled alongside contains/startsWith/endsWith
      default:
        return true
    }
  })
}

function matchWhere(db, record, where, modelName) {
  if (!where || Object.keys(where).length === 0) return true
  return Object.entries(where).every(([key, cond]) => {
    if (key === 'OR') return Array.isArray(cond) && cond.some((c) => matchWhere(db, record, c, modelName))
    if (key === 'AND') return Array.isArray(cond) && cond.every((c) => matchWhere(db, record, c, modelName))
    if (key === 'NOT') return !matchWhere(db, record, cond, modelName)

    const relation = SCHEMA[modelName] && SCHEMA[modelName].relations[key]
    if (relation && relation.type === 'belongsTo') {
      const related = db[relation.model].find((r) => r.id === record[relation.fk]) || null
      return matchWhere(db, related || {}, cond, relation.model)
    }
    if (relation && (relation.type === 'hasMany' || relation.type === 'hasOne')) {
      // 'some'/'every'/'none' filters aren't used by this codebase; treat plainly if encountered.
      const list = db[relation.model].filter((r) => r[relation.fk] === record.id)
      if (cond && cond.some) return list.some((r) => matchWhere(db, r, cond.some, relation.model))
      if (cond && cond.none) return !list.some((r) => matchWhere(db, r, cond.none, relation.model))
      if (cond && cond.every) return list.every((r) => matchWhere(db, r, cond.every, relation.model))
      return true
    }

    return matchFieldCondition(record[key], cond)
  })
}

function sortRecords(list, orderBy) {
  if (!orderBy) return list
  const specs = Array.isArray(orderBy) ? orderBy : [orderBy]
  const copy = [...list]
  copy.sort((a, b) => {
    for (const spec of specs) {
      const [field, dir] = Object.entries(spec)[0]
      const av = toComparable(a[field])
      const bv = toComparable(b[field])
      if (av < bv) return dir === 'desc' ? 1 : -1
      if (av > bv) return dir === 'desc' ? -1 : 1
    }
    return 0
  })
  return copy
}

function pick(record, selectSpec) {
  if (!record) return record
  const out = {}
  for (const [key, val] of Object.entries(selectSpec)) {
    if (val) out[key] = record[key]
  }
  return out
}

function applyInclude(db, record, includeSpec, modelName) {
  if (!includeSpec) return record
  const result = { ...record }
  for (const [key, spec] of Object.entries(includeSpec)) {
    if (!spec) continue
    if (key === '_count') {
      result._count = {}
      const countSelect = spec.select || {}
      for (const relName of Object.keys(countSelect)) {
        const rel = SCHEMA[modelName].relations[relName]
        if (!rel) continue
        result._count[relName] = db[rel.model].filter((r) => r[rel.fk] === record.id).length
      }
      continue
    }

    const rel = SCHEMA[modelName] && SCHEMA[modelName].relations[key]
    if (!rel) continue

    if (rel.type === 'belongsTo' || rel.type === 'hasOne') {
      let related =
        rel.type === 'belongsTo'
          ? db[rel.model].find((r) => r.id === record[rel.fk]) || null
          : db[rel.model].find((r) => r[rel.fk] === record.id) || null
      if (related && typeof spec === 'object') {
        if (spec.include) related = applyInclude(db, related, spec.include, rel.model)
        if (spec.select) related = pick(related, spec.select)
      }
      result[key] = related
    } else if (rel.type === 'hasMany') {
      let list = db[rel.model].filter((r) => r[rel.fk] === record.id)
      if (typeof spec === 'object') {
        if (spec.where) list = list.filter((r) => matchWhere(db, r, spec.where, rel.model))
        if (spec.orderBy) list = sortRecords(list, spec.orderBy)
        if (typeof spec.skip === 'number') list = list.slice(spec.skip)
        if (typeof spec.take === 'number') list = list.slice(0, spec.take)
        if (spec.include) list = list.map((r) => applyInclude(db, r, spec.include, rel.model))
        if (spec.select) list = list.map((r) => pick(r, spec.select))
      }
      result[key] = list
    }
  }
  return result
}

module.exports = {
  deepClone,
  toComparable,
  valuesEqual,
  matchWhere,
  sortRecords,
  pick,
  applyInclude,
}

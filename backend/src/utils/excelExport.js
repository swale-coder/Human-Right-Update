const ExcelJS = require('exceljs')

/**
 * Streams rows as an .xlsx file. Flattens nested objects shallowly
 * (e.g. row.user.fullName -> "user.fullName" column) for readability.
 */
async function streamExcel(res, sheetName, rows) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)

  if (rows.length === 0) {
    sheet.addRow(['No data available'])
  } else {
    const flatten = (obj, prefix = '') =>
      Object.entries(obj).reduce((acc, [key, value]) => {
        if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
          Object.assign(acc, flatten(value, `${prefix}${key}.`))
        } else {
          acc[`${prefix}${key}`] = Array.isArray(value) ? value.length : value
        }
        return acc
      }, {})

    const flatRows = rows.map((r) => flatten(r))
    const headers = Object.keys(flatRows[0])
    sheet.addRow(headers)
    sheet.getRow(1).font = { bold: true }
    flatRows.forEach((row) => sheet.addRow(headers.map((h) => row[h])))
    sheet.columns.forEach((col) => { col.width = 20 })
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${sheetName}.xlsx"`)
  await workbook.xlsx.write(res)
  res.end()
}

module.exports = { streamExcel }

// Thin wrapper so controllers can `const asyncHandler = require('../utils/asyncHandler')`
// without coupling directly to the third-party package name.
module.exports = require('express-async-handler')

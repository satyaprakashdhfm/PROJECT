const express = require('express')
const router = express.Router()
const {importFromBank} = require('../controllers/importController')
const protect = require('../utilities/authMiddleware')

router.post('/bank', protect, importFromBank)

module.exports = router

const express = require('express')
const router = express.Router()
const {exportToExcel, exportToPDF} = require('../controllers/exportController')
const protect = require('../utilities/authMiddleware')

router.get('/excel', protect, exportToExcel)
router.get('/pdf', protect, exportToPDF)

module.exports = router

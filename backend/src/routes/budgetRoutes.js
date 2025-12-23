const express = require('express')
const router = express.Router()
const {setBudget, getBudgets, getBudgetByCategory, deleteBudget} = require('../controllers/budgetController')
const protect = require('../utilities/authMiddleware')

router.post('/set', protect, setBudget)
router.get('/', protect, getBudgets)
router.get('/:category', protect, getBudgetByCategory)
router.delete('/:category', protect, deleteBudget)

module.exports = router 
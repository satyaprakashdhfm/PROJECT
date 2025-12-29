const express = require('express')
const router = express.Router()
const {setBudget, getBudgets, getBudgetByCategory, deleteBudget, updateBudget, getBudgetPlanner} = require('../controllers/budgetController')
const protect = require('../utilities/authMiddleware')

router.post('/set', protect, setBudget)
router.get('/', protect, getBudgets)
router.get('/planner', protect, getBudgetPlanner)
router.get('/:category', protect, getBudgetByCategory)
router.put('/:category', protect, updateBudget)
router.delete('/:category', protect, deleteBudget)

module.exports = router 
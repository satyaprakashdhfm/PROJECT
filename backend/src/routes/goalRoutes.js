const express = require('express')
const router = express.Router()
const {
    createGoal, 
    getGoals, 
    updateGoalProgress, 
    deleteGoal,
    getCategoryReport,
    getTimeBasedReport,
    getSpendingTrends
} = require('../controllers/goalController')
const protect = require('../utilities/authMiddleware')

// Goal routes
router.post('/', protect, createGoal)
router.get('/', protect, getGoals)
router.put('/:goalId/progress', protect, updateGoalProgress)
router.delete('/:goalId', protect, deleteGoal)

// Report routes
router.get('/reports/category', protect, getCategoryReport)
router.get('/reports/time', protect, getTimeBasedReport)
router.get('/reports/trends', protect, getSpendingTrends)

module.exports = router

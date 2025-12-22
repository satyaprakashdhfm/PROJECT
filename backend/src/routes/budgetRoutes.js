const express = require('express')
const router = express.Router()
const setBudget = require('../controllers/budgetController')
const protect = require('../utilities/authMiddleware')

console.log(typeof setBudget)
console.log(typeof protect)
router.post('/set',protect,setBudget)

module.exports = router 
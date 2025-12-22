const express = require('express')
const router = express.Router()

const {addExpense} = require('../controllers/expenseController')
const protect = require('../utilities/authMiddleware')

// console.log(typeof addExpense)
// console.log(typeof protect)
router.post("/add",protect,addExpense)

module.exports = router 
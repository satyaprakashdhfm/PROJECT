const express = require('express')
const router = express.Router()

const {addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense} = require('../controllers/expenseController')
const protect = require('../utilities/authMiddleware')

router.post("/add",protect,addExpense)
router.get("/",protect,getExpenses)
router.get("/:id",protect,getExpenseById)
router.put("/:id",protect,updateExpense)
router.delete("/:id",protect,deleteExpense)

module.exports = router 
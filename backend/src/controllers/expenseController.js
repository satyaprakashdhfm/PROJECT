/**
 * User Story 2: Manual Expense Entry
 * Description: As a user, I should be able to enter my daily expenses manually into the application.
 * 
 * Features:
 * - addExpense() - Add new expense with amount, date, category, description, and merchant
 * - getExpenses() - Get all user expenses with optional filters (category, date range, merchant)
 * - getExpenseById() - Get single expense by ID
 * - updateExpense() - Update existing expense
 * - deleteExpense() - Delete expense
 */

const Expense = require('../model/Expense')
const Budget = require('../model/Budget')

const addExpense = async (req,res) => {  
    try { 
        const {amount,date,description,category,merchant} = req.body

        if(!amount || !date || !description || !category) 
            return res.status(400).json({error:"All fields are required"})

        // Check for duplicate expense
        const duplicate = await Expense.findOne({
            user: req.user.id,
            amount,
            date: new Date(date),
            description,
            merchant: merchant || ''
        });

        if (duplicate) {
            return res.status(409).json({
                error: "Duplicate expense detected",
                message: "An expense with the same amount, date, description, and merchant already exists"
            });
        }

        const expense = await Expense.create({
            user:req.user.id,
            amount,date,description,category,merchant});

        //calculating total spent in a category
        const total = await Expense.aggregate([
            {$match:{
                user:expense.user, category}},
            {$group:{
              _id: null,
              totalSpent:{$sum:"$amount"}}}
        ])

        const spent = total[0]?.totalSpent || 0; 
        const budget = await Budget.findOne({userId:req.user.id,category});

        let alert = null
        if(budget && spent > budget.budget_amount){
            alert = `Budget exceeded for ${category}`;
        }

         res.status(201).json({message: "Expense added successfully", alert})
    }
    catch(error){
        res.status(400).json({error: "Invalid request body"})
    }
}

const getExpenses = async (req,res) => {
    try{
        const {category, startDate, endDate, merchant} = req.query
        
        let filter = {user: req.user.id}
        
        if(category) filter.category = category
        if(merchant) filter.merchant = new RegExp(merchant, 'i')
        if(startDate || endDate){ 
            filter.date = {}
            if(startDate) filter.date.$gte = new Date(startDate)
            if(endDate) filter.date.$lte = new Date(endDate)
        }
        
        const expenses = await Expense.find(filter).sort({date: -1})
        
        res.status(200).json({
            message: "Expenses fetched successfully",
            count: expenses.length,
            data: expenses
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch expenses"})
    }
}

const getExpenseById = async (req,res) => {
    try{
        const {id} = req.params
        
        const expense = await Expense.findOne({_id: id, user: req.user.id})
        if(!expense) return res.status(404).json({error: "Expense not found"})
        
        res.status(200).json({
            message: "Expense fetched successfully",
            data: expense
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch expense"})
    }
}

const updateExpense = async (req,res) => {
    try{
        const {id} = req.params
        const {amount, date, description, category, merchant} = req.body
        
        const expense = await Expense.findOne({_id: id, user: req.user.id})
        
        if(!expense) return res.status(404).json({error: "Expense not found"})
        
        if(amount) expense.amount = amount
        if(date) expense.date = date
        if(description) expense.description = description
        if(category) expense.category = category
        if(merchant !== undefined) expense.merchant = merchant
        
        await expense.save()
        
        res.status(200).json({
            message: "Expense updated successfully",
            data: expense
        })
    }
    catch(error){
        res.status(400).json({error: "Failed to update expense"})
    }
}

const deleteExpense = async (req,res) => {
    try{
        const {id} = req.params
        
        console.log('DELETE /api/v1/expense/:id')
        
        const expense = await Expense.findOneAndDelete({_id: id, user: req.user.id})
        
        if(!expense) {
            return res.status(404).json({error: "Expense not found"})
        }
        
        res.status(200).json({message: "Expense deleted successfully"})
    }
    catch(error){
        res.status(500).json({error: "Failed to delete expense"})
    }
}

module.exports = {addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense}  
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

        // Check budget BEFORE adding expense
        const budget = await Budget.findOne({userId:req.user.id, category});
        
        if(budget) {
            // Calculate current total spent in this category
            const total = await Expense.aggregate([
                {$match:{
                    user:req.user.id, category}},
                {$group:{
                  _id: null,
                  totalSpent:{$sum:"$amount"}}}
            ]);

            const currentSpent = total[0]?.totalSpent || 0;
            const newTotal = currentSpent + parseFloat(amount);

            // Prevent adding expense if it exceeds budget
            if(newTotal > budget.budget_amount){
                return res.status(400).json({
                    error: "Budget limit exceeded",
                    message: `Adding this expense will exceed your budget for ${category}. Current: ₹${currentSpent}, Budget: ₹${budget.budget_amount}, After adding: ₹${newTotal}`,
                    currentSpent,
                    budgetAmount: budget.budget_amount,
                    proposedTotal: newTotal
                });
            }
        }

        // Only create expense if budget check passes
        const expense = await Expense.create({
            user:req.user.id,
            amount,date,description,category,merchant});

         res.status(201).json({message: "Expense added successfully"})
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
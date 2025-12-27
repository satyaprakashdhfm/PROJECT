const Budget = require('../model/Budget')
const Expense = require('../model/Expense')

const setBudget = async(req,res)=>{
    const {category,budget_amount} = req.body

    try{
        if(!category || !budget_amount){
            return res.status(400).json({error:"Category and limit required"})
        }

        let budget = await Budget.findOne({
            userId: req.user.id,
            category
        })

        if(budget){
            budget.budget_amount = budget_amount
            await budget.save()
        }
        else {
            budget = await Budget.create({
                userId: req.user.id,
                category,
                budget_amount
            })
        }

        res.status(201).json({message: "Budget set successfully"})
    }
    catch(error){
        res.status(400).json({error: "Invalid request body"})
    }
}

const getBudgets = async(req,res)=>{
    try{
        const budgets = await Budget.find({userId: req.user.id})
        
        res.status(200).json({
            message: "Budgets fetched successfully",
            data: budgets
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch budgets"})
    }
}

const getBudgetByCategory = async(req,res)=>{
    const {category} = req.params

    try{
        const budget = await Budget.findOne({
            userId: req.user.id,
            category
        })

        if(!budget) return res.status(404).json({error: "Budget not found"})

        res.status(200).json({
            message: "Budget fetched successfully",
            data: budget
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch budget"})
    }
}

const deleteBudget = async(req,res)=>{
    const {category} = req.params

    try{
        console.log('DELETE /api/v1/budgets/:category')

        const budget = await Budget.findOneAndDelete({
            userId: req.user.id,
            category
        })

        if(!budget) {
            return res.status(404).json({error: "Budget not found"})
        }

        res.status(200).json({message: "Budget deleted successfully"})
    }
    catch(error){
        res.status(500).json({error: "Failed to delete budget"})
    }
}

const getBudgetPlanner = async(req,res)=>{
    try{
        const budgets = await Budget.find({userId: req.user.id})
        const expenses = await Expense.find({user: req.user.id})
        
        // Calculate past 3 months average spending per category
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        
        const recentExpenses = expenses.filter(exp => new Date(exp.date) >= threeMonthsAgo)
        
        const categorySpending = {}
        recentExpenses.forEach(exp => {
            if(!categorySpending[exp.category]) categorySpending[exp.category] = 0
            categorySpending[exp.category] += exp.amount
        })
        
        // Calculate monthly average and project for next month
        const monthCount = 3
        const plannerData = budgets.map(budget => {
            const pastAverage = (categorySpending[budget.category] || 0) / monthCount
            const projectedNextMonth = pastAverage
            const recommendedBudget = Math.ceil(pastAverage * 1.1) // 10% buffer
            
            return {
                category: budget.category,
                currentBudget: budget.budget_amount,
                pastMonthlyAverage: pastAverage.toFixed(2),
                projectedNextMonth: projectedNextMonth.toFixed(2),
                recommendedBudget,
                difference: (budget.budget_amount - recommendedBudget).toFixed(2),
                status: budget.budget_amount >= recommendedBudget ? "adequate" : "insufficient"
            }
        })
        
        res.status(200).json({
            message: "Budget planner data fetched successfully",
            data: plannerData
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch budget planner"})
    }
}

module.exports = {setBudget, getBudgets, getBudgetByCategory, deleteBudget, getBudgetPlanner}
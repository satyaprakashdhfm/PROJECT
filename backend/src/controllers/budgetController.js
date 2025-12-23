/**
 * User Story 4: Budget Setting
 * Description: As a user, I should be able to set budgets for different expense categories.
 * 
 * Features:
 * - setBudget() - Set or update budget for a category
 * - getBudgets() - Fetch all user budgets
 * - getBudgetByCategory() - Get specific budget by category
 * - deleteBudget() - Remove a budget
 */

const Budget = require('../model/Budget')

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
        const budget = await Budget.findOneAndDelete({
            userId: req.user.id,
            category
        })

        if(!budget) return res.status(404).json({error: "Budget not found"})

        res.status(200).json({message: "Budget deleted successfully"})
    }
    catch(error){
        res.status(500).json({error: "Failed to delete budget"})
    }
}

module.exports = {setBudget, getBudgets, getBudgetByCategory, deleteBudget}
/**
 * User Story 2: Manual Expense Entry
 * Description: As a user, I should be able to enter my daily expenses manually into the application.
 * 
 * Features:
 * - addExpense() - Add new expense with amount, date, category, and description
 */

const Expense = require('../model/Expense')

const Budget = require('../model/Budget')

addExpense = async (req,res) => {  
    try { 
        const {amount,date,description,category} = req.body

        if(!amount || !date || !description || !category) 
            return res.status(400).json({error:"All fields are required"})

        const expense = await Expense.create({
            user:req.user.id,
            amount,date,description,category});

        //calculating total spent in a category
        const total = await Expense.aggregate([
            {$match:{
                user:expense.user, category}},
            {$group:{
              totalSpent:{$sum:"$amount"}}}
        ])

        const spent = total[0]?.totalSpent || 0; 
        const budget = await Budget.findOne({user:req.user.id,category});

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

module.exports = {addExpense}  
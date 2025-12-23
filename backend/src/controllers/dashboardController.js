/**
 * User Story 5: Expense Dashboard
 * Description: As a user, I should be able to view my expenses on a dashboard with graphs and charts.
 * 
 * Features:
 * - getSummary() - Get complete dashboard data including total expenses, expenses by category, 
 *                  expenses by month, recent expenses, budget comparison, and statistics
 *                  Supports filtering by category, date range, and merchant
 */

const Expense = require('../model/Expense')
const Budget = require('../model/Budget')

exports.getSummary = async(req,res) => {
    try{
        const userId = req.user.id
        const {category, startDate, endDate, merchant} = req.query
        
        let filter = {user: userId}
        
        if(category) filter.category = category
        if(merchant) filter.merchant = new RegExp(merchant, 'i')
        if(startDate || endDate){
            filter.date = {}
            if(startDate) filter.date.$gte = new Date(startDate)
            if(endDate) filter.date.$lte = new Date(endDate)
        }
        
        const expenses = await Expense.find(filter).sort({date: -1});
        const budgets = await Budget.find({userId});

        // Calculate total expenses
        let totalExpenses = 0;
        const expensesByCategory = {}
        const expensesByMonth = {}

        // Process expenses
        expenses.forEach(exp => {
            totalExpenses += exp.amount

            // Group by category
            if(!expensesByCategory[exp.category]){
                expensesByCategory[exp.category] = 0
            }
            expensesByCategory[exp.category] += exp.amount

            // Group by month (YYYY-MM format)
            const monthKey = exp.date.toISOString().slice(0, 7)
            if(!expensesByMonth[monthKey]){
                expensesByMonth[monthKey] = 0
            }
            expensesByMonth[monthKey] += exp.amount
        })

        // Get recent expenses (last 10)
        const recentExpenses = expenses.slice(0, 10).map(exp => ({
            id: exp._id,
            amount: exp.amount,
            category: exp.category,
            description: exp.description,
            date: exp.date
        }))

        // Budget comparison
        const budgetComparison = budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0
            const remaining = budget.budget_amount - spent
            const percentageUsed = ((spent / budget.budget_amount) * 100).toFixed(2)
            
            return {
                category: budget.category,
                budgetAmount: budget.budget_amount,
                spent,
                remaining,
                percentageUsed,
                isExceeded: spent > budget.budget_amount
            }
        })

        // Statistics for visualization
        const statistics = {
            totalCategories: Object.keys(expensesByCategory).length,
            totalBudgets: budgets.length,
            highestExpenseCategory: Object.keys(expensesByCategory).reduce((a, b) => 
                expensesByCategory[a] > expensesByCategory[b] ? a : b, null
            ),
            averageExpensePerMonth: Object.keys(expensesByMonth).length > 0 
                ? (totalExpenses / Object.keys(expensesByMonth).length).toFixed(2) 
                : 0
        }

        res.status(200).json({
            message: "Dashboard data fetched successfully",
            data: {
                totalExpenses,
                expensesByCategory,
                expensesByMonth,
                recentExpenses,
                budgetComparison,
                statistics
            }
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch dashboard data"})
    }
} 
/**
 * User Story 7: Financial Goals & Progress Tracking + Custom Reports
 * Description: As a user, I should be able to set financial goals, track progress, 
 *              and create custom reports that provide insights into spending patterns.
 * 
 * Features:
 * GOALS:
 * - createGoal() - Set a new financial goal
 * - getGoals() - Fetch all user goals with progress
 * - updateGoalProgress() - Update progress towards goal
 * - deleteGoal() - Remove a goal
 * 
 * REPORTS:
 * - getCategoryReport() - Detailed category-wise spending analysis with budget comparison
 * - getTimeBasedReport() - Daily/weekly/monthly spending reports
 * - getSpendingTrends() - Spending trends with insights and patterns
 */

const Goal = require('../model/Goal')
const Expense = require('../model/Expense')
const Budget = require('../model/Budget')

// ==================== GOAL MANAGEMENT ====================

exports.createGoal = async(req,res) => {
    try{
        const {goal, target_amount} = req.body

        if(!goal || !target_amount){
            return res.status(400).json({error: "Goal name and target amount required"})
        }

        const newGoal = await Goal.create({
            userId: req.user.id,
            goal,
            target_amount,
            current_amount: 0
        })

        res.status(201).json({
            message: "Goal created successfully",
            data: newGoal
        })
    }
    catch(error){
        res.status(400).json({error: "Failed to create goal"})
    }
}

exports.getGoals = async(req,res) => {
    try{
        const goals = await Goal.find({userId: req.user.id})

        // Calculate progress for each goal
        const goalsWithProgress = goals.map(goal => {
            const progress = goal.current_amount ? 
                ((goal.current_amount / parseFloat(goal.target_amount)) * 100).toFixed(2) : 0
            
            return {
                ...goal.toObject(),
                progress: `${progress}%`,
                remaining: parseFloat(goal.target_amount) - (goal.current_amount || 0)
            }
        })

        res.status(200).json({
            message: "Goals fetched successfully",
            data: goalsWithProgress
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to fetch goals"})
    }
}

exports.updateGoalProgress = async(req,res) => {
    try{
        const {goalId} = req.params
        const {amount} = req.body

        console.log('PUT /api/v1/goals/:goalId/progress')

        if(!amount){
            return res.status(400).json({error: "Amount required"})
        }

        const goal = await Goal.findOne({_id: goalId, userId: req.user.id})

        if(!goal){
            return res.status(404).json({error: "Goal not found"})
        }

        goal.current_amount = (goal.current_amount || 0) + amount
        await goal.save()

        const progress = ((goal.current_amount / parseFloat(goal.target_amount)) * 100).toFixed(2)

        res.status(200).json({
            message: "Goal progress updated",
            data: {
                goal: goal.goal,
                current: goal.current_amount,
                target: goal.target_amount,
                progress: `${progress}%`
            }
        })
    }
    catch(error){
        res.status(400).json({error: "Failed to update goal progress"})
    }
}

exports.deleteGoal = async(req,res) => {
    try{
        const {goalId} = req.params

        console.log('DELETE /api/v1/goals/:goalId')

        const goal = await Goal.findOneAndDelete({_id: goalId, userId: req.user.id})

        if(!goal){
            return res.status(404).json({error: "Goal not found"})
        }

        res.status(200).json({message: "Goal deleted successfully"})
    }
    catch(error){
        res.status(500).json({error: "Failed to delete goal"})
    }
}

// ==================== CUSTOM REPORTS ====================

exports.getCategoryReport = async(req,res) => {
    try{
        const expenses = await Expense.find({user: req.user.id})
        const budgets = await Budget.find({userId: req.user.id})

        // Calculate spending by category
        const categoryData = {}
        expenses.forEach(exp => {
            if(!categoryData[exp.category]){
                categoryData[exp.category] = {
                    totalSpent: 0,
                    count: 0,
                    expenses: []
                }
            }
            categoryData[exp.category].totalSpent += exp.amount
            categoryData[exp.category].count += 1
            categoryData[exp.category].expenses.push({
                amount: exp.amount,
                description: exp.description,
                date: exp.date
            })
        })

        // Add budget comparison
        const report = Object.keys(categoryData).map(category => {
            const budget = budgets.find(b => b.category === category)
            const data = categoryData[category]
            
            return {
                category,
                totalSpent: data.totalSpent,
                transactionCount: data.count,
                averagePerTransaction: (data.totalSpent / data.count).toFixed(2),
                budget: budget ? budget.budget_amount : null,
                remaining: budget ? budget.budget_amount - data.totalSpent : null,
                percentageUsed: budget ? ((data.totalSpent / budget.budget_amount) * 100).toFixed(2) : null
            }
        })

        res.status(200).json({
            message: "Category report generated successfully",
            data: report
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to generate category report"})
    }
}

exports.getTimeBasedReport = async(req,res) => {
    try{
        const {period} = req.query // daily, weekly, monthly
        const expenses = await Expense.find({user: req.user.id}).sort({date: 1})

        let groupedData = {}
        
        expenses.forEach(exp => {
            let key
            const date = new Date(exp.date)
            
            if(period === 'daily'){
                key = date.toISOString().split('T')[0] // YYYY-MM-DD
            } else if(period === 'weekly'){
                const week = Math.ceil(date.getDate() / 7)
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${week}`
            } else { // monthly
                key = date.toISOString().slice(0, 7) // YYYY-MM
            }

            if(!groupedData[key]){
                groupedData[key] = {
                    total: 0,
                    count: 0,
                    byCategory: {}
                }
            }
            
            groupedData[key].total += exp.amount
            groupedData[key].count += 1
            
            if(!groupedData[key].byCategory[exp.category]){
                groupedData[key].byCategory[exp.category] = 0
            }
            groupedData[key].byCategory[exp.category] += exp.amount
        })

        res.status(200).json({
            message: `${period} report generated successfully`,
            data: groupedData
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to generate time-based report"})
    }
}

exports.getSpendingTrends = async(req,res) => {
    try{
        const expenses = await Expense.find({user: req.user.id}).sort({date: 1})

        if(expenses.length === 0){
            return res.status(200).json({
                message: "No expenses found",
                data: {trends: [], insights: []}
            })
        }

        // Calculate monthly trends
        const monthlyData = {}
        expenses.forEach(exp => {
            const month = exp.date.toISOString().slice(0, 7)
            if(!monthlyData[month]){
                monthlyData[month] = 0
            }
            monthlyData[month] += exp.amount
        })

        const months = Object.keys(monthlyData).sort()
        const trends = months.map(month => ({
            month,
            amount: monthlyData[month]
        }))

        // Generate insights
        const insights = []
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const avgMonthly = totalSpent / months.length

        // Category insights
        const categoryTotals = {}
        expenses.forEach(exp => {
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
        })
        
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b
        )

        insights.push(`Your highest spending category is ${topCategory} with ₹${categoryTotals[topCategory]}`)
        insights.push(`Your average monthly spending is ₹${avgMonthly.toFixed(2)}`)

        // Trend analysis
        if(months.length >= 2){
            const lastMonth = monthlyData[months[months.length - 1]]
            const prevMonth = monthlyData[months[months.length - 2]]
            const change = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(2)
            
            if(change > 0){
                insights.push(`Your spending increased by ${change}% last month`)
            } else if(change < 0){
                insights.push(`Your spending decreased by ${Math.abs(change)}% last month`)
            } else {
                insights.push(`Your spending remained stable last month`)
            }
        }

        res.status(200).json({
            message: "Spending trends generated successfully",
            data: {trends, insights}
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to generate spending trends"})
    }
}

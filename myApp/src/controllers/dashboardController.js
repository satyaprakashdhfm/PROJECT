const Expense = require('../model/Expense')

exports.getSummary = async(req,res) => {
    try{
        const userId = req.user.userId
        const expenses = await Expense.find({user:userId});

        let totalExpenses = 0;
        const expensesByCategory = {}
        const expensesByMonth = {}

        expenses.forEach(exp => {
            totalExpenses += exp.amount
        })

        if(!expensesByCategory[exp.category]){
            expensesByCategory[exp.category]=0
        }
    }
    catch(error){

    }
} 
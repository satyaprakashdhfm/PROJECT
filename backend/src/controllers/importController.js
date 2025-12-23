/**
 * User Story 3: Bank Account Import
 * Description: As a user, I should be able to import my expenses from my bank account into the application.
 * 
 * Features:
 * - importFromBank() - Import expenses from bank CSV/JSON file and auto-categorize
 */

const Expense = require('../model/Expense')
const categorizeExpense = require('../utilities/categorize')

exports.importFromBank = async(req,res) => {
    try{
        const {transactions} = req.body // Array of transactions from bank
        
        if(!transactions || !Array.isArray(transactions)){
            return res.status(400).json({error: "Valid transactions array required"})
        }

        const importedExpenses = []
        const errors = []

        for(let i = 0; i < transactions.length; i++){
            const txn = transactions[i]
            
            try{
                // Validate transaction data
                if(!txn.amount || !txn.date || !txn.description){
                    errors.push({index: i, error: "Missing required fields"})
                    continue
                }

                // Auto-categorize based on description
                const category = categorizeExpense(txn.description)

                // Create expense
                const expense = await Expense.create({
                    user: req.user.id,
                    amount: Math.abs(txn.amount), // Ensure positive
                    date: new Date(txn.date),
                    category,
                    description: txn.description
                })

                importedExpenses.push(expense)
            }
            catch(error){
                errors.push({index: i, error: error.message})
            }
        }

        res.status(200).json({
            message: "Import completed",
            data: {
                imported: importedExpenses.length,
                failed: errors.length,
                expenses: importedExpenses,
                errors
            }
        })
    }
    catch(error){
        res.status(500).json({error: "Failed to import transactions"})
    }
}

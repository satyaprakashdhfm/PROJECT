const Expense = require('../model/Expense')
const categorizeExpense = require('../utilities/categorize')

exports.importFromBank = async(req,res) => {
    try{
        const {transactions} = req.body // Array of transactions from bank (or frontend-parsed Excel)
        
        if(!transactions || !Array.isArray(transactions)){
            return res.status(400).json({error: "Valid transactions array required"})
        }

        const importedExpenses = []
        const errors = []

        for(let i = 0; i < transactions.length; i++){
            const txn = transactions[i]
            
            try{
                // Validate required fields
                if(!txn.amount || !txn.date || !txn.description){
                    errors.push({index: i, error: "Missing required fields"})
                    continue
                }

                // Validate amount is a positive number
                const amount = parseFloat(txn.amount)
                if(isNaN(amount) || amount <= 0){
                    errors.push({index: i, error: "Invalid amount - must be positive number"})
                    continue
                }

                // Validate date format
                const date = new Date(txn.date)
                if(isNaN(date.getTime())){
                    errors.push({index: i, error: "Invalid date format"})
                    continue
                }

                // Validate description length
                if(txn.description.length < 3 || txn.description.length > 200){
                    errors.push({index: i, error: "Description must be 3-200 characters"})
                    continue
                }

                // Check for duplicate expense
                const merchant = txn.merchant ? txn.merchant.trim() : ''
                const duplicate = await Expense.findOne({
                    user: req.user.id,
                    amount: Math.abs(amount),
                    date,
                    description: txn.description.trim(),
                    merchant: merchant || { $in: [null, ''] }
                })

                if (duplicate) {
                    errors.push({index: i, error: "Duplicate expense - already exists"})
                    continue
                }

                // Auto-categorize based on description
                const category = categorizeExpense(txn.description)

                // Create expense
                const expense = await Expense.create({
                    user: req.user.id,
                    amount: Math.abs(amount),
                    date,
                    category,
                    description: txn.description.trim(),
                    merchant: merchant || null
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

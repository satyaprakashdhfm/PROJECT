const Budget = require('../model/Budget')

const setBudget = async(req,res)=>{
    const {category,budget_amount} = req.body

    try{
        if(!category || !budget_amount){
            return res.status(400).json({error:"Category and limit required"})
        }

        let budget = await Budget.findOne({category})

        if(budget){
            budget.budget_amount = budget_amount
            await budget.save()
        }
        else {
            budget = await Budget.create({category,budget_amount})
        }

        res.status(201).json({"message": "Budget set successfully"})
    }
    catch(error){
        res.status(400).json({"error": "Invalid request body"})
    }
}

module.exports = setBudget
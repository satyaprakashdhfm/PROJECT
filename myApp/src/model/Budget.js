const mongoose = require("mongoose")

const budgetSchema = new mongoose.Schema(
    {
        category:{
            type:String,
            required:true
        } ,
        budget_amount:{
            type:Number,
            require:true
        }
    },
    {timestamps:true}
)

module.exports = mongoose.model("Budget",budgetSchema)
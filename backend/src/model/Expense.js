const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
        date:{
            type:Date,
            required:true
        },
        category:{
            type:String,
            required:true,
            enum:["Food","Travel","Shopping","Bills","Other"]
        },
        description:{
            type:String,
            required:true
        },
        merchant:{
            type:String,
            required:false
        }
    },
    {timestamps:true}
);

module.exports = mongoose.model("Expense",expenseSchema)
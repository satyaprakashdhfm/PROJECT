const moongoose = require('mongoose')

const expenseSchema = new moongoose.Schema(
    {
        // userId:{
        //     type:mongoose.Schema.Types.ObjectId,
        //     ref:"User",
        //     required:true
        // },
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
        }
    },
    {timestamps:true}
);

module.exports = moongoose.model("Expense",expenseSchema)
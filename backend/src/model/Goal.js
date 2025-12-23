const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        goal:{
            type:String,
            required:true,
        },
        target_amount:{
            type:Number,
            required:true
        },
        current_amount:{
            type:Number,
            default:0
        }
    },
    {timestamps:true}
)


module.exports = mongoose.model('Goal',goalSchema)
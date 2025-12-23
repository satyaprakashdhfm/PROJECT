const moongoose = require('mongoose')

const goalSchema = new moongoose.Schema(
    {
        userId:{
            type:moongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        goal:{
            type:String,
            required:true,
        },
        target_amount:{
            type:String,
            required:true
        },
        current_amount:{
            type:Number,
            default:0
        }
    },
    {timestamps:true}
)


module.exports = moongoose.model('Goal',goalSchema)
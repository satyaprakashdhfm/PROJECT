const moongoose = require('mongoose')

const goalSchema = new moongoose.Schema(
    {
        goal:{
            type:String,
            required:true,
        },
        target_amount:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)


module.exports = moongoose.model('Goal',goalSchema)
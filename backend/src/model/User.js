const moongoose = require('mongoose')

const userSchema = new moongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)

module.exports = moongoose.model('User',userSchema) 
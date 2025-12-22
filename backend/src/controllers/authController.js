const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.registerUser = async(req,res) => {
    
    try{
        const {email,password} = req.body
        // console.log(req.body)
      
        if(!email || !password) res.status(400).json({error:"Email and password are required"});
        const userExists = await User.findOne({email}) 
        // console.log(userExists)
        if(userExists) 
            res.status(400).json({message:"User already exists"})
        else {
        // const salt =await bcrypt.genSalt(10)
        const hashPassword =await bcrypt.hash(password,10)

        const user = await User.create({   
            email,password:hashPassword
        }) 

        res.status(201).json({message:"User registered successfully"})
    }
    }
    catch(error){ 
        res.status(400).json({"error":"Invalid request body"})
    }
}

exports.loginUser = async(req,res) => {
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch==false){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const token = jwt.sign({id:user._id},
                               process.env.JWT_SECRET,
                               {expiresIn:"1d"});
        // console.log(token)
        res.status(200).json({message:token}) 
    }
    catch(error){
        res.status(401).json({"error":"Invalid credentials"})
    }
}


exports.resetPassword = async(req,res) => {
    
}